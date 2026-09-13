import os
import sys

# Force all native libraries to single-threaded mode to prevent cloud multi-core thread pool memory crashes (512MB RAM budget)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

def _load_env_fallback():
    for p in [Path(__file__).resolve().parent.parent / ".env", Path(".env")]:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k, v = k.strip(), v.strip().strip('"').strip("'")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
    load_dotenv()
except ImportError:
    pass

_load_env_fallback()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

try:
    from .main import process_product_image
    from .database_adapter import get_inspection_report, init_db
    from .label_validation import InvalidProductLabelError
except (ImportError, ValueError):
    from main import process_product_image
    from database_adapter import get_inspection_report, init_db
    from label_validation import InvalidProductLabelError

# Base output paths
OUTPUT_DIR = Path("output")
UPLOADS_DIR = OUTPUT_DIR / "uploads"
PREPROCESSED_DIR = OUTPUT_DIR / "preprocessed"
INSPECTIONS_DIR = OUTPUT_DIR / "inspections"

for d in [UPLOADS_DIR, PREPROCESSED_DIR, INSPECTIONS_DIR]:
    os.makedirs(d, exist_ok=True)

# Initialize database schema on startup
init_db()

app = FastAPI(
    title="TRUVA Legal Metrology Inspection API",
    description="Automated statutory declaration extraction and compliance verification pipeline",
    version="2.0.0"
)

import asyncio
import gc

processing_lock = asyncio.Lock()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "TRUVA Legal Metrology Inspection Backend",
        "timestamp": datetime.now().isoformat(),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }


@app.get("/api/debug")
async def debug_pipeline():
    """Diagnostic endpoint to pinpoint exact component status on Render."""
    steps = {}
    import numpy as np
    import cv2
    from .main import create_ocr

    # 1. Test OpenCV
    try:
        dummy = np.ones((100, 100, 3), dtype=np.uint8) * 255
        cv2.putText(dummy, "TEST", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
        steps["opencv"] = "OK"
    except Exception as e:
        steps["opencv"] = f"FAIL: {e}"

    # 2. Test RapidOCR Init & Inference
    try:
        ocr = create_ocr()
        if ocr is None:
            steps["ocr_init"] = "Returned None"
        else:
            steps["ocr_init"] = "OK"
            res, _ = ocr(dummy)
            steps["ocr_inference"] = f"OK (detections: {len(res) if res else 0})"
    except Exception as e:
        steps["ocr_error"] = f"FAIL: {e}"

    # 3. Test Database
    try:
        rep = get_inspection_report("INS-TEST")
        steps["database"] = "OK"
    except Exception as e:
        steps["database"] = f"FAIL: {e}"

    return steps


@app.post("/api/debug_step")
def debug_step_by_step(image: UploadFile = File(...)):
    logs = {}
    try:
        # Step 1: Read Image
        content = image.file.read()
        logs["file_read"] = f"OK ({len(content)} bytes)"
        
        # Step 2: OpenCV Decode
        import numpy as np
        import cv2
        nparr = np.frombuffer(content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            logs["cv2_decode"] = "FAIL: img is None"
            return logs
        logs["cv2_decode"] = f"OK shape: {img.shape}"
        
        # Step 3: Resize Check
        h, w = img.shape[:2]
        if max(h, w) > 1000:
            scale = 1000.0 / max(h, w)
            img = cv2.resize(img, (int(w*scale), int(h*scale)), interpolation=cv2.INTER_AREA)
        logs["resized_shape"] = f"{img.shape}"
        
        # Step 4: Run OCR
        from .main import create_ocr
        ocr = create_ocr()
        res, _ = ocr(img)
        logs["ocr_items_count"] = len(res) if res else 0
        
        # Step 5: Gemini check
        from .main import call_gemini, validate_product_label_ocr
        ocr_items = []
        if res:
            for idx, line in enumerate(res):
                box, text, score = line[0], line[1], line[2]
                x_coords = [p[0] for p in box]
                y_coords = [p[1] for p in box]
                ocr_items.append({
                    "text": str(text).strip(),
                    "confidence": float(score),
                    "bbox": [float(min(x_coords)), float(min(y_coords)), float(max(x_coords)), float(max(y_coords))],
                    "center_x": round((min(x_coords) + max(x_coords)) / 2, 2),
                    "center_y": round((min(y_coords) + max(y_coords)) / 2, 2),
                    "source_index": idx
                })
        val = validate_product_label_ocr(ocr_items)
        logs["label_validation"] = val
        
        gemini_res = call_gemini(ocr_items)
        logs["gemini_text_len"] = len(gemini_res)
        logs["gemini_snippet"] = gemini_res[:100]
        
    except Exception as e:
        import traceback
        logs["error"] = str(e)
        logs["traceback"] = traceback.format_exc()
        
    return logs


import threading
processing_lock = threading.Lock()

@app.post("/api/inspect")
def inspect_product(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    inspection_code: Optional[str] = Form(None),
    ocr_only: bool = Form(False),
    perspective: bool = Form(False)
):
    """
    Main Inspection Endpoint.
    Accepts an uploaded image file, stores it safely,
    and runs the memory-optimized ML pipeline under a thread lock.
    """
    upload_target = image or file
    if not upload_target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An image file is required."
        )
    image = upload_target
    raw_fname = image.filename or "uploaded_label.jpg"
    ext = Path(raw_fname).suffix.lower() if Path(raw_fname).suffix else ".jpg"
    if not ext or ext not in ALLOWED_EXTENSIONS:
        ext = ".jpg"

    # Generate unique inspection ID and file path
    if not inspection_code:
        unique_token = uuid.uuid4().hex[:6].upper()
        inspection_code = f"INS-2026-{unique_token}"

    safe_filename = f"{inspection_code}_{uuid.uuid4().hex[:4]}{ext}"
    saved_image_path = UPLOADS_DIR / safe_filename

    # Save uploaded file safely
    try:
        with open(saved_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded image: {str(e)}"
        )
    finally:
        image.file.close()
        gc.collect()

    # Run ML Extraction and Compliance Pipeline with lock
    with processing_lock:
        try:
            result = process_product_image(
                image_path=str(saved_image_path),
                output_dir=str(OUTPUT_DIR),
                inspection_code=inspection_code,
                ocr_only=ocr_only,
                perspective=perspective
            )
            return JSONResponse(content=result)
        except InvalidProductLabelError as val_err:
            print(f"[VALIDATION REJECTED] {val_err.reason} (code: {val_err.code})")
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "success": False,
                    "detail": {
                        "code": val_err.code,
                        "message": val_err.message,
                        "reason": val_err.reason,
                        "metrics": val_err.metrics
                    }
                }
            )
        except Exception as exc:
            print(f"[API ERROR] Inspection failed: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Inspection processing failed: {str(exc)}"
            )
        finally:
            gc.collect()


@app.get("/api/inspections/{code}")
async def get_inspection(code: str):
    """Fetches a stored inspection report by inspection code."""
    report = get_inspection_report(code)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection '{code}' not found."
        )
    return report
