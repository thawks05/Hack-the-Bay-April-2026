"""
CSV ingestion and cleaning for all three file types:
  - utility:    facility/zip data for map pins
  - timeseries: time-stamped energy readings
  - event:      special demand events (e.g. Gasparilla)

All three share the same CSV schema. The `file_type` field tags them.
"""

import pandas as pd
import io
from typing import Literal

# Required columns present in every CSV type
REQUIRED_COLS = {
    "timestamp",
    "facility_id",
    "facility_name",
    "lat",
    "lon",
    "zone",
    "source_type",
}

# Optional but used when present
NUMERIC_COLS = [
    "capacity_mw",
    "generation_mw",
    "consumption_mw",
    "import_mw",
    "export_mw",
    "co2_lbs_per_mwh",
    "loss_mw",
    "peak_load_mw",
    "avg_load_mw",
]

FileType = Literal["utility", "timeseries", "event"]


def detect_file_type(df: pd.DataFrame, hint: str | None = None) -> FileType:
    """
    Use the caller-supplied hint first. Fall back to column-based detection.
    """
    if hint in ("utility", "timeseries", "event"):
        return hint  # type: ignore[return-value]

    cols = set(df.columns.str.lower())
    if "event_name" in cols or "event_type" in cols:
        return "event"
    if "timestamp" in cols and df["timestamp"].nunique() > 5:
        return "timeseries"
    return "utility"


def parse_and_clean(raw_bytes: bytes, filename: str, file_type_hint: str | None = None) -> dict:
    """
    Parse a CSV, clean it, and return a structured dict with:
      - file_type
      - dataframe (cleaned)
      - summary stats
      - any warnings
    """
    warnings = []

    try:
        df = pd.read_csv(io.BytesIO(raw_bytes))
    except Exception as e:
        raise ValueError(f"Could not parse {filename} as CSV: {e}")

    # Normalise column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # Check required columns
    missing = REQUIRED_COLS - set(df.columns)
    if missing:
        warnings.append(f"Missing columns (will be filled with nulls): {sorted(missing)}")
        for col in missing:
            df[col] = None

    # Coerce numeric columns
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows with no lat/lon — can't place them on map
    before = len(df)
    df = df.dropna(subset=["lat", "lon"])
    dropped = before - len(df)
    if dropped:
        warnings.append(f"Dropped {dropped} rows missing lat/lon")

    # Coerce lat/lon to float
    df["lat"] = df["lat"].astype(float)
    df["lon"] = df["lon"].astype(float)

    # Parse timestamp if present
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

    file_type = detect_file_type(df, file_type_hint)

    summary = {
        "rows": len(df),
        "file_type": file_type,
        "zones": df["zone"].dropna().unique().tolist() if "zone" in df.columns else [],
        "source_types": df["source_type"].dropna().unique().tolist() if "source_type" in df.columns else [],
        "total_generation_mw": round(df["generation_mw"].sum(), 2) if "generation_mw" in df.columns else None,
        "total_consumption_mw": round(df["consumption_mw"].sum(), 2) if "consumption_mw" in df.columns else None,
        "warnings": warnings,
    }

    return {"file_type": file_type, "dataframe": df, "summary": summary}
