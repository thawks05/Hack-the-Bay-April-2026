"""
Tampa PowerIQ — Backend API
Run: uvicorn main:app --reload
"""

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os

from backend.upload import router as upload_router, get_session_summaries, get_uploaded_dataframes
from backend.map_data import build_geojson
from backend.zones import (
    load_zones_geojson, load_config, list_zone_names,
    ingest_zones_geojson, reset_to_default
)
from backend.agent import ask_agent, build_roadmap
from backend.scoring import score_projects

app = FastAPI(title="Tampa PowerIQ", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before any real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")

# Serve mock CSV files so the browser's "Load Mock Tampa Data" button can fetch them
app.mount("/data", StaticFiles(directory="data"), name="data")

# Serve the UI
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_ui():
    return FileResponse("static/index.html")


# ---------------------------------------------------------------------------
# Zones — city-agnostic neighborhood GeoJSON
# ---------------------------------------------------------------------------

@app.get("/api/zones/geojson")
def get_zones_geojson():
    """Return the active zone GeoJSON (uploaded or Tampa default)."""
    return load_zones_geojson()


@app.get("/api/zones/config")
def get_zones_config():
    """Return which GeoJSON is active and what field holds zone names."""
    cfg = load_config()
    cfg["zone_names"] = list_zone_names()
    return cfg


class ZonesUpload(BaseModel):
    name_field:  str   # property field in the GeoJSON that holds the zone name
    city_label:  str   # human label e.g. "Orlando, FL"


@app.post("/api/zones/upload")
async def upload_zones_geojson(
    file: UploadFile = File(...),
    name_field: str = Form("NAME"),
    city_label: str = Form("My City"),
):
    raw = await file.read()
    try:
        summary = ingest_zones_geojson(raw, name_field, city_label)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return summary


@app.post("/api/zones/reset")
def reset_zones():
    """Revert to the built-in Tampa GeoJSON."""
    reset_to_default()
    return {"message": "Reset to Tampa default"}


# ---------------------------------------------------------------------------
# Map
# ---------------------------------------------------------------------------

@app.get("/api/map")
def get_map_data():
    """
    Return GeoJSON pin layer + zone summary derived from all uploaded CSVs.
    If no files uploaded, returns empty map.
    """
    dfs = get_uploaded_dataframes()
    return build_geojson(dfs)


# ---------------------------------------------------------------------------
# Agent chat
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    query: str
    include_context: bool = True  # inject uploaded CSV summaries into prompt


@app.post("/api/chat")
def chat(req: ChatRequest):
    """
    Send a question to the Gemma 4 energy agent.
    Returns the agent's response + top 5 scored project recommendations.
    """
    summaries = get_session_summaries() if req.include_context else None
    result = ask_agent(req.query, summaries)
    return result


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

@app.get("/api/recommendations")
def get_recommendations():
    """Return all projects scored and ranked."""
    return {"projects": score_projects()}


# ---------------------------------------------------------------------------
# Roadmap
# ---------------------------------------------------------------------------

class RoadmapRequest(BaseModel):
    horizons: list[int] = [5, 10, 20]


@app.post("/api/roadmap")
def get_roadmap(req: RoadmapRequest):
    """
    Ask the agent to build a phased energy roadmap.
    Default horizons: 5yr, 10yr, 20yr.
    """
    summaries = get_session_summaries()
    return build_roadmap(req.horizons, summaries)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    from backend.config import OLLAMA_MODEL
    return {"status": "ok", "model": OLLAMA_MODEL}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
