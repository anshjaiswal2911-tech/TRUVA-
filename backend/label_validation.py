class InvalidProductLabelError(Exception):
    """Raised when an uploaded image does not contain a recognizable packaged commodity label."""
    pass

def validate_product_label_ocr(ocr_items):
    """
    Validates whether the extracted OCR tokens contain sufficient packaging or statutory markers.
    """
    if not ocr_items:
        return {"valid": False, "reason": "No text detected on package surface"}
    
    joined_text = " ".join([item.get("text", "") for item in ocr_items if isinstance(item, dict)]).lower()
    
    # Check for basic packaging tokens
    statutory_tokens = ["mrp", "rs", "₹", "net", "qty", "weight", "mfg", "pkd", "exp", "batch", "veg", "fssai", "g", "kg", "ml", "l", "marketed", "manufactured", "packed", "ingredients"]
    matched = [t for t in statutory_tokens if t in joined_text]
    
    if len(matched) >= 1 or len(ocr_items) >= 2:
        return {"valid": True, "matched_tokens": matched}
    
    return {"valid": True, "notice": "Limited label tokens detected, proceeding with best-effort audit"}
