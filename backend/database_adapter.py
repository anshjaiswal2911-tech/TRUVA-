"""
Database adapter for SQLite database management, inspection storage,
declaration ingestion, rule evaluation persistence, and report retrieval.
"""

import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from .rule_engine import STANDARD_RULES, evaluate_product_compliance, calculate_overall_compliance
except (ImportError, ValueError):
    from rule_engine import STANDARD_RULES, evaluate_product_compliance, calculate_overall_compliance

DEFAULT_DB_PATH = os.environ.get("DATABASE_PATH") or os.path.join("output", "truva_database.db")


def get_db_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Returns a SQLite connection with foreign keys enabled."""
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: str = DEFAULT_DB_PATH) -> None:
    """Initializes schema and seeds standard statutory rules."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    # 1. Inspections Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inspections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspection_code TEXT UNIQUE NOT NULL,
        product_name TEXT,
        brand TEXT,
        category TEXT,
        image_path TEXT,
        status TEXT DEFAULT 'completed',
        overall_status TEXT DEFAULT 'UNKNOWN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Rules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        section TEXT,
        description TEXT,
        required_field TEXT,
        severity TEXT DEFAULT 'CRITICAL'
    );
    """)

    # 3. Extracted Declarations Table (Full evidence preservation)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS extracted_declarations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspection_id INTEGER NOT NULL,
        field_name TEXT NOT NULL,
        field_value TEXT,
        raw_text TEXT,
        normalized_text TEXT,
        confidence REAL DEFAULT 0.0,
        source_indices TEXT,
        section TEXT,
        FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
    );
    """)

    # 4. Rule Evaluations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rule_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspection_id INTEGER NOT NULL,
        rule_id INTEGER NOT NULL,
        declaration_id INTEGER,
        result TEXT NOT NULL,
        actual_value TEXT,
        message TEXT,
        evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
        FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
        FOREIGN KEY (declaration_id) REFERENCES extracted_declarations(id) ON DELETE SET NULL
    );
    """)

    # Seed/sync the 17 Standard Rules
    for rule in STANDARD_RULES:
        cursor.execute("""
        INSERT INTO rules (rule_code, title, section, description, required_field, severity)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(rule_code) DO UPDATE SET
            title = excluded.title,
            section = excluded.section,
            description = excluded.description,
            required_field = excluded.required_field,
            severity = excluded.severity;
        """, (
            rule["rule_code"],
            rule["title"],
            rule["section"],
            rule["description"],
            rule["required_field"],
            rule["severity"]
        ))

    # Clean up obsolete rule codes
    valid_codes = [r["rule_code"] for r in STANDARD_RULES]
    cursor.execute(f"DELETE FROM rules WHERE rule_code NOT IN ({','.join(['?']*len(valid_codes))})", valid_codes)

    conn.commit()
    conn.close()


def create_inspection(inspection_code: str,
                      product_name: Optional[str] = None,
                      brand: Optional[str] = None,
                      category: Optional[str] = None,
                      image_path: Optional[str] = None,
                      db_path: str = DEFAULT_DB_PATH) -> int:
    """Creates a new inspection record and returns its ID."""
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO inspections (inspection_code, product_name, brand, category, image_path)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(inspection_code) DO UPDATE SET
        product_name = excluded.product_name,
        brand = excluded.brand,
        category = excluded.category,
        image_path = excluded.image_path;
    """, (inspection_code, product_name, brand, category, image_path))

    cursor.execute("SELECT id FROM inspections WHERE inspection_code = ?;", (inspection_code,))
    inspection_id = cursor.fetchone()[0]

    conn.commit()
    conn.close()
    return inspection_id


def ingest_product_json(data: Dict[str, Any],
                        inspection_code: str,
                        image_path: Optional[str] = None,
                        db_path: str = DEFAULT_DB_PATH) -> Tuple[int, str]:
    """
    Parses final_product.json, inserts declarations, runs rule evaluations,
    and updates inspection status.
    Returns (inspection_id, overall_status).
    """
    init_db(db_path)
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    product_info = data.get("product", {})
    p_name = product_info.get("name", {}).get("normalized_text") or product_info.get("name", {}).get("raw_text")
    p_brand = product_info.get("brand", {}).get("normalized_text") or product_info.get("brand", {}).get("raw_text")
    p_category = product_info.get("category", {}).get("normalized_text") or product_info.get("category", {}).get("raw_text")

    # Create / update inspection
    cursor.execute("""
    INSERT INTO inspections (inspection_code, product_name, brand, category, image_path)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(inspection_code) DO UPDATE SET
        product_name = excluded.product_name,
        brand = excluded.brand,
        category = excluded.category,
        image_path = excluded.image_path;
    """, (inspection_code, p_name, p_brand, p_category, image_path))

    cursor.execute("SELECT id FROM inspections WHERE inspection_code = ?;", (inspection_code,))
    inspection_id = cursor.fetchone()[0]

    # Clear prior declarations & evaluations for this inspection if re-running
    cursor.execute("DELETE FROM rule_evaluations WHERE inspection_id = ?;", (inspection_id,))
    cursor.execute("DELETE FROM extracted_declarations WHERE inspection_id = ?;", (inspection_id,))

    # Declaration mapping list
    declarations_to_insert = []

    def add_decl(field_name: str, field_data: Any, section: str = "general"):
        if not field_data:
            return
        if isinstance(field_data, dict):
            raw = field_data.get("raw_text")
            norm = field_data.get("normalized_text") or field_data.get("normalized_date")
            val = field_data.get("value")
            disp_val = norm or (str(val) if val is not None else raw)
            conf = float(field_data.get("confidence", 0.0) or 0.0)
            indices = json.dumps(field_data.get("source_indices", []))
            if raw or norm or val is not None:
                declarations_to_insert.append((
                    inspection_id, field_name, disp_val, raw, norm, conf, indices, section
                ))
        elif isinstance(field_data, list):
            for idx, item in enumerate(field_data):
                if isinstance(item, dict):
                    add_decl(f"{field_name}[{idx}]", item, section)
                elif item:
                    declarations_to_insert.append((
                        inspection_id, f"{field_name}[{idx}]", str(item), str(item), str(item), 1.0, "[]", section
                    ))

    # Add key fields
    add_decl("product.name", product_info.get("name"), "product")
    add_decl("product.brand", product_info.get("brand"), "product")
    add_decl("product.category", product_info.get("category"), "product")
    add_decl("product.common_name", product_info.get("common_name"), "product")

    packaging = data.get("packaging", {})
    add_decl("packaging.mrp", packaging.get("mrp"), "packaging")
    add_decl("packaging.unit_sale_price", packaging.get("unit_sale_price"), "packaging")
    add_decl("packaging.net_quantity", packaging.get("net_quantity"), "packaging")
    add_decl("packaging.package_type", packaging.get("package_type"), "packaging")

    dates = data.get("dates", {})
    add_decl("dates.manufacturing_date", dates.get("manufacturing_date"), "dates")
    add_decl("dates.packing_date", dates.get("packing_date"), "dates")
    add_decl("dates.expiry_date", dates.get("expiry_date"), "dates")
    add_decl("dates.best_before", dates.get("best_before"), "dates")

    entities = data.get("entities", {})
    add_decl("entities.manufacturer", entities.get("manufacturer"), "entities")
    add_decl("entities.packer", entities.get("packer"), "entities")
    add_decl("entities.importer", entities.get("importer"), "entities")
    add_decl("entities.brand_owner", entities.get("brand_owner"), "entities")

    addresses = data.get("addresses", {})
    add_decl("addresses.manufacturer", addresses.get("manufacturer"), "addresses")
    add_decl("addresses.packer", addresses.get("packer"), "addresses")
    add_decl("addresses.consumer_care", addresses.get("consumer_care"), "addresses")

    origin = data.get("origin", {})
    add_decl("origin.country_of_origin", origin.get("country_of_origin"), "origin")

    reg = data.get("regulatory", {})
    add_decl("regulatory.batch.batch_number", reg.get("batch", {}).get("batch_number"), "regulatory")
    add_decl("regulatory.fssai.license_numbers", reg.get("fssai", {}).get("license_numbers"), "regulatory")

    consumer_info = data.get("consumer_information", {})
    add_decl("consumer_information.customer_care_phone", consumer_info.get("customer_care_phone"), "consumer")
    add_decl("consumer_information.customer_care_email", consumer_info.get("customer_care_email"), "consumer")
    add_decl("consumer_information.website", consumer_info.get("website"), "consumer")

    # Insert declarations and track created IDs
    decl_id_map: Dict[str, int] = {}
    for item in declarations_to_insert:
        cursor.execute("""
        INSERT INTO extracted_declarations (
            inspection_id, field_name, field_value, raw_text, normalized_text,
            confidence, source_indices, section
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, item)
        decl_id = cursor.lastrowid
        decl_id_map[item[1]] = decl_id

    # Evaluate rules
    evaluations = evaluate_product_compliance(data)
    overall_status = calculate_overall_compliance(evaluations)

    # Fetch rule IDs
    cursor.execute("SELECT id, rule_code FROM rules;")
    rule_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    # Insert evaluations
    for ev in evaluations:
        rule_id = rule_id_map.get(ev["rule_code"])
        if not rule_id:
            continue
        
        # Link declaration ID if available
        matched_decl_id = decl_id_map.get(ev.get("field_name"))
        if not matched_decl_id:
            # Fallback search for partial field match
            for fname, did in decl_id_map.items():
                if fname.startswith(ev.get("field_name", "")):
                    matched_decl_id = did
                    break

        cursor.execute("""
        INSERT INTO rule_evaluations (
            inspection_id, rule_id, declaration_id, result, actual_value, message
        ) VALUES (?, ?, ?, ?, ?, ?);
        """, (
            inspection_id,
            rule_id,
            matched_decl_id,
            ev["result"],
            ev["actual_value"],
            ev["message"]
        ))

    # Update overall status on inspection
    cursor.execute("""
    UPDATE inspections
    SET overall_status = ?, status = 'completed'
    WHERE id = ?;
    """, (overall_status, inspection_id))

    conn.commit()
    conn.close()

    return inspection_id, overall_status


def evaluate_rules(inspection_code: str,
                   db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """
    Executes the exact reporting query from sih.sql and returns compliance records.
    """
    query = """
    SELECT
        r.rule_code,
        r.title,
        d.field_name,
        d.field_value,
        re.result,
        re.actual_value,
        re.message
    FROM rule_evaluations re
    JOIN rules r
        ON r.id = re.rule_id
    LEFT JOIN extracted_declarations d
        ON d.id = re.declaration_id
    WHERE re.inspection_id = (
        SELECT id
        FROM inspections
        WHERE inspection_code = ?
    )
    ORDER BY r.id;
    """

    results = []
    try:
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        cursor.execute(query, (inspection_code,))
        rows = cursor.fetchall()
        for row in rows:
            results.append({
                "rule_code": row[0],
                "title": row[1],
                "field_name": row[2],
                "field_value": row[3],
                "result": row[4],
                "actual_value": row[5],
                "message": row[6]
            })
        conn.close()
    except Exception as e:
        print(f"   Database query error: {e}")

    return results


def get_inspection_report(inspection_code: str,
                          db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Fetches full inspection metadata and compliance results."""
    try:
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, inspection_code, product_name, brand, category, image_path, overall_status, created_at
        FROM inspections
        WHERE inspection_code = ?;
        """, (inspection_code,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return None

        rules = evaluate_rules(inspection_code, db_path)
        return {
            "id": row[0],
            "inspection_code": row[1],
            "product_name": row[2],
            "brand": row[3],
            "category": row[4],
            "image_path": row[5],
            "overall_status": row[6],
            "created_at": row[7],
            "rules": rules
        }
    except Exception as e:
        print(f"   Error fetching inspection report: {e}")
        return None
