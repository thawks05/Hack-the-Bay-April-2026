"""
Convert processed DataFrames into GeoJSON for the frontend map.

Output has two layers:
  1. facility_pins  — one point per facility row
  2. zone_summary   — one entry per Tampa zone with net flow stats
"""

import pandas as pd
from typing import Any

# Map source_type to a display colour for the frontend
SOURCE_COLORS = {
    "solar": "#F59E0B",      # amber
    "wind": "#3B82F6",       # blue
    "natural_gas": "#6B7280",# gray
    "hydro": "#06B6D4",      # cyan
    "storage": "#8B5CF6",    # purple
    "nuclear": "#EF4444",    # red
    "grid_import": "#10B981",# green
    "consumer": "#D1D5DB",   # light gray
    "substation": "#374151", # dark gray
}


def _pin_feature(row: pd.Series) -> dict:
    source = str(row.get("source_type", "")).lower()
    gen = row.get("generation_mw", 0) or 0
    cons = row.get("consumption_mw", 0) or 0

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row["lon"]), float(row["lat"])],
        },
        "properties": {
            "facility_id": row.get("facility_id", ""),
            "facility_name": row.get("facility_name", ""),
            "source_type": source,
            "fuel_type": row.get("fuel_type", ""),
            "zone": row.get("zone", ""),
            "capacity_mw": row.get("capacity_mw"),
            "generation_mw": gen,
            "consumption_mw": cons,
            "import_mw": row.get("import_mw"),
            "export_mw": row.get("export_mw"),
            "co2_lbs_per_mwh": row.get("co2_lbs_per_mwh"),
            "operating_status": row.get("operating_status", ""),
            "color": SOURCE_COLORS.get(source, "#9CA3AF"),
            # radius scaled to generation, clamped between 6–24px
            "radius": min(24, max(6, int(gen / 10) if gen else 6)),
        },
    }


def _zone_status(net_flow: float) -> str:
    if net_flow > 10:
        return "surplus"
    if net_flow < -10:
        return "deficit"
    return "balanced"


def build_geojson(dataframes: list[pd.DataFrame]) -> dict[str, Any]:
    """
    Merge all uploaded DataFrames and produce the map payload.
    """
    if not dataframes:
        return {"pins": {"type": "FeatureCollection", "features": []}, "zones": []}

    combined = pd.concat(dataframes, ignore_index=True)

    # --- Facility pins ---
    pin_features = []
    for _, row in combined.iterrows():
        try:
            pin_features.append(_pin_feature(row))
        except Exception:
            continue  # skip malformed rows silently

    # --- Zone summary ---
    zone_rows = []
    if "zone" in combined.columns:
        for zone, grp in combined.groupby("zone"):
            gen = grp["generation_mw"].sum() if "generation_mw" in grp.columns else 0
            cons = grp["consumption_mw"].sum() if "consumption_mw" in grp.columns else 0
            imp = grp["import_mw"].sum() if "import_mw" in grp.columns else 0
            exp = grp["export_mw"].sum() if "export_mw" in grp.columns else 0
            net = (gen + imp) - (cons + exp)
            zone_rows.append(
                {
                    "zone": zone,
                    "generation_mw": round(gen, 2),
                    "consumption_mw": round(cons, 2),
                    "net_flow_mw": round(net, 2),
                    "status": _zone_status(net),
                    "facility_count": len(grp),
                }
            )

    return {
        "pins": {"type": "FeatureCollection", "features": pin_features},
        "zones": zone_rows,
    }
