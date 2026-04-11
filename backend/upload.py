"""
CSV upload endpoints.

POST /api/upload
  - Accepts one or more CSV files with a file_type hint
  - Stores them in data/uploads/
  - Returns per-file summaries

GET /api/uploads
  - Lists all uploaded files and their summaries

DELETE /api/uploads
  - Clears all uploaded data (for fresh onboarding)
"""

import os
import json
import shutil
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from backend.processor import parse_and_clean
from backend.config import UPLOAD_DIR


def _safe(v):
    """Convert numpy/pandas scalars to native Python types for JSON serialization."""
    import numpy as np
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return float(v)
    if isinstance(v, (np.ndarray,)):
        return v.tolist()
    return v

router = APIRouter()

# In-memory store of summaries for this session
# { filename: summary_dict }
_session_summaries: dict = {}

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_files(
    files: Optional[list[UploadFile]] = File(None),   # Timothy's test UI (plural)
    file:  Optional[UploadFile]       = File(None),   # Jose's frontend (singular)
    file_type: Optional[str] = Form(None),
):
    """
    Upload one or more CSVs. `file_type` applies to all files in this batch.
    If omitted, type is auto-detected from column names.
    """
    # Normalise: accept either `file` (singular from Next.js) or `files` (plural from test UI)
    all_uploads: list[UploadFile] = []
    if files:
        all_uploads.extend(files)
    if file:
        all_uploads.append(file)

    if not all_uploads:
        return JSONResponse({"uploads": [], "error": "No files received"})

    results = []

    for upload in all_uploads:
        raw = await upload.read()

        try:
            parsed = parse_and_clean(raw, upload.filename, file_type_hint=file_type)
        except ValueError as e:
            results.append({"filename": upload.filename, "error": str(e)})
            continue

        # Persist to disk
        dest = os.path.join(UPLOAD_DIR, upload.filename)
        with open(dest, "wb") as f:
            f.write(raw)

        # Store summary (without the dataframe — not serialisable)
        summary = {k: _safe(v) for k, v in parsed["summary"].items()}
        _session_summaries[upload.filename] = summary

        results.append(
            {
                "filename": upload.filename,
                "file_type": parsed["file_type"],
                "summary": summary,
            }
        )

    return JSONResponse({"uploads": results})


@router.get("/uploads")
def list_uploads():
    """Return all uploaded file summaries for this session."""
    return {"uploads": _session_summaries}


@router.delete("/uploads")
def clear_uploads():
    """Remove all uploaded files and reset session."""
    global _session_summaries
    if os.path.exists(UPLOAD_DIR):
        shutil.rmtree(UPLOAD_DIR)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
    _session_summaries = {}
    return {"message": "All uploads cleared"}


def get_session_summaries() -> dict:
    """Used by other modules to access current upload context."""
    return _session_summaries


def get_uploaded_dataframes():
    """
    Re-parse all uploaded CSVs from disk and return a list of DataFrames.
    Used by map_data and agent modules.
    """
    from backend.processor import parse_and_clean
    dfs = []
    for fname in os.listdir(UPLOAD_DIR):
        if not fname.endswith(".csv"):
            continue
        path = os.path.join(UPLOAD_DIR, fname)
        with open(path, "rb") as f:
            raw = f.read()
        try:
            parsed = parse_and_clean(raw, fname)
            dfs.append(parsed["dataframe"])
        except Exception:
            continue
    return dfs
