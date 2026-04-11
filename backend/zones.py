"""
Zone GeoJSON management.

During onboarding the operator either:
  (a) uploads their own neighborhood/district GeoJSON, or
  (b) uses the built-in Tampa default (for demo/hackathon)

They also specify which property field in the GeoJSON holds the zone name
(e.g. "AssocLabel" for Tampa, "NAME" for many census datasets, "district" etc.)

Everything downstream — map colouring, CSV zone_id matching — uses that one field.
"""

import json
import os
import shutil
from typing import Optional

DATA_DIR      = os.path.join(os.path.dirname(__file__), "..", "data")
ZONES_PATH    = os.path.join(DATA_DIR, "active_zones.geojson")
TAMPA_DEFAULT = os.path.join(DATA_DIR, "tampa_neighborhoods.geojson")
CONFIG_PATH   = os.path.join(DATA_DIR, "zones_config.json")


# ── Config helpers ────────────────────────────────────────────────────────────

def _default_config() -> dict:
    return {
        "name_field":  "AssocLabel",   # which GeoJSON property is the zone name
        "city_label":  "Tampa, FL",
        "source":      "default",      # "default" | "uploaded"
    }


def load_config() -> dict:
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH) as f:
            return json.load(f)
    return _default_config()


def save_config(cfg: dict) -> None:
    with open(CONFIG_PATH, "w") as f:
        json.dump(cfg, f)


# ── GeoJSON helpers ───────────────────────────────────────────────────────────

def active_geojson_path() -> str:
    return ZONES_PATH if os.path.exists(ZONES_PATH) else TAMPA_DEFAULT


def load_zones_geojson() -> dict:
    with open(active_geojson_path()) as f:
        return json.load(f)


def get_name_field() -> str:
    return load_config().get("name_field", "AssocLabel")


def list_zone_names() -> list[str]:
    """Return all unique zone names from the active GeoJSON."""
    geo   = load_zones_geojson()
    field = get_name_field()
    names = [
        f["properties"].get(field, "")
        for f in geo.get("features", [])
        if f["properties"].get(field)
    ]
    return sorted(set(names))


# ── Upload ────────────────────────────────────────────────────────────────────

def ingest_zones_geojson(raw_bytes: bytes, name_field: str, city_label: str) -> dict:
    """
    Validate and store a GeoJSON uploaded during onboarding.
    Returns a summary dict.
    """
    try:
        geo = json.loads(raw_bytes)
    except Exception as e:
        raise ValueError(f"Invalid GeoJSON: {e}")

    if geo.get("type") != "FeatureCollection":
        raise ValueError("GeoJSON must be a FeatureCollection")

    features = geo.get("features", [])
    if not features:
        raise ValueError("GeoJSON has no features")

    # Verify the name_field exists on at least the first feature
    sample = features[0].get("properties", {})
    if name_field not in sample:
        available = list(sample.keys())
        raise ValueError(
            f"Field '{name_field}' not found in GeoJSON properties. "
            f"Available fields: {available}"
        )

    # Save
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(ZONES_PATH, "wb") as f:
        f.write(raw_bytes)

    cfg = {"name_field": name_field, "city_label": city_label, "source": "uploaded"}
    save_config(cfg)

    zone_names = [
        feat["properties"].get(name_field, "")
        for feat in features
        if feat["properties"].get(name_field)
    ]

    return {
        "feature_count":  len(features),
        "name_field":     name_field,
        "city_label":     city_label,
        "sample_zones":   sorted(set(zone_names))[:10],
    }


def reset_to_default() -> None:
    """Revert to the built-in Tampa GeoJSON."""
    if os.path.exists(ZONES_PATH):
        os.remove(ZONES_PATH)
    save_config(_default_config())
