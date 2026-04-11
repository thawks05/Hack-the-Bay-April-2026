"""
Convert processed DataFrames into map layers using real Tampa neighborhood GeoJSON.

Zone aggregation uses allocation_pct so split-zone facilities are counted correctly:
  zone_generation  = sum(generation_mw  * allocation_pct) where zone_id = X
  zone_consumption = sum(consumption_mw * allocation_pct) where zone_id = X
  zone_net_flow    = zone_generation - zone_consumption
"""

import json
import os
import pandas as pd
from typing import Any
from backend.zones import load_zones_geojson, get_name_field

SOURCE_COLORS = {
    "solar":        "#F59E0B",
    "wind":         "#3B82F6",
    "natural_gas":  "#6B7280",
    "hydro":        "#06B6D4",
    "storage":      "#8B5CF6",
    "nuclear":      "#EF4444",
    "grid_import":  "#10B981",
    "consumer":     "#D1D5DB",
    "substation":   "#374151",
}


def _safe(val) -> Any:
    """Convert numpy scalar types to native Python for JSON serialisation."""
    if val is None:
        return None
    try:
        import numpy as np
        if isinstance(val, np.integer):
            return int(val)
        if isinstance(val, np.floating):
            return float(val)
        if isinstance(val, float) and val != val:   # NaN
            return None
    except ImportError:
        pass
    return val


def _zone_status(net_flow: float) -> str:
    if net_flow > 10:
        return "surplus"
    if net_flow < -10:
        return "deficit"
    return "balanced"


def _net_flow_color(net_flow: float) -> tuple[str, float]:
    """Return (hex_color, opacity) for a zone polygon based on net flow."""
    if net_flow > 50:
        return "#166534", 0.55   # dark green — strong surplus
    if net_flow > 10:
        return "#15803d", 0.40   # green — surplus
    if net_flow >= -10:
        return "#1e3a5f", 0.30   # blue — balanced
    if net_flow >= -50:
        return "#991b1b", 0.40   # red — deficit
    return "#7f1d1d", 0.55       # dark red — strong deficit


def _pin_feature(row: pd.Series) -> dict:
    source = str(row.get("source_type", "")).lower()
    gen  = _safe(row.get("generation_mw"))  or 0
    cons = _safe(row.get("consumption_mw")) or 0
    risk = str(row.get("outage_risk", "") or "").lower()

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row["lon"]), float(row["lat"])],
        },
        "properties": {
            "facility_id":      str(row.get("facility_id", "")),
            "facility_name":    str(row.get("facility_name", "")),
            "source_type":      source,
            "fuel_type":        str(row.get("fuel_type", "")),
            "zone_id":          str(row.get("zone_id", "")),
            "allocation_pct":   _safe(row.get("allocation_pct")) or 1.0,
            "capacity_mw":      _safe(row.get("capacity_mw")),
            "generation_mw":    gen,
            "consumption_mw":   cons,
            "import_mw":        _safe(row.get("import_mw")),
            "export_mw":        _safe(row.get("export_mw")),
            "co2_lbs_per_mwh":  _safe(row.get("co2_lbs_per_mwh")),
            "operating_status": str(row.get("operating_status", "")),
            "outage_risk":      risk,
            "last_outage_date": str(row.get("last_outage_date", "") or ""),
            "outage_duration":  _safe(row.get("outage_duration")),
            "notes":            str(row.get("notes", "") or ""),
            "color":            SOURCE_COLORS.get(source, "#9CA3AF"),
            "radius":           min(24, max(6, int(gen / 10) if gen else 6)),
        },
    }


def _flow_features(df: pd.DataFrame) -> list[dict]:
    """Lines from generators to consumers sharing the same zone_id."""
    flows = []
    generators = df[
        df["source_type"].str.lower().isin(
            ["solar", "wind", "generator", "natural_gas", "hydro", "nuclear", "grid_import"]
        )
        & df["generation_mw"].notna()
        & (df["generation_mw"] > 0)
    ]
    consumers = df[
        df["source_type"].str.lower().isin(["consumer", "substation"])
        & df["consumption_mw"].notna()
        & (df["consumption_mw"] > 0)
    ]

    for _, gen in generators.iterrows():
        zone_consumers = consumers[consumers["zone_id"] == gen.get("zone_id", "")]
        for _, con in zone_consumers.iterrows():
            mw = _safe(gen.get("generation_mw", 0)) or 0
            flows.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [float(gen["lon"]), float(gen["lat"])],
                        [float(con["lon"]), float(con["lat"])],
                    ],
                },
                "properties": {
                    "from":     str(gen.get("facility_name", "")),
                    "to":       str(con.get("facility_name", "")),
                    "zone_id":  str(gen.get("zone_id", "")),
                    "flow_mw":  mw,
                    "weight":   min(6, max(1, int(mw / 60))),
                },
            })
    return flows


def build_geojson(dataframes: list[pd.DataFrame]) -> dict[str, Any]:
    empty = {
        "pins":       {"type": "FeatureCollection", "features": []},
        "flows":      {"type": "FeatureCollection", "features": []},
        "zone_stats": [],
    }
    if not dataframes:
        return empty

    combined = pd.concat(dataframes, ignore_index=True)

    # ── Pins ──────────────────────────────────────────────────────
    pin_features = []
    for _, row in combined.iterrows():
        try:
            pin_features.append(_pin_feature(row))
        except Exception:
            continue

    # ── Zone stats (allocation_pct weighted) ──────────────────────
    zone_stats = []
    if "zone_id" in combined.columns:
        for zone_id, grp in combined.groupby("zone_id"):
            pct  = grp["allocation_pct"] if "allocation_pct" in grp.columns else 1.0
            gen  = float((grp["generation_mw"]  * pct).sum()) if "generation_mw"  in grp.columns else 0.0
            cons = float((grp["consumption_mw"] * pct).sum()) if "consumption_mw" in grp.columns else 0.0
            imp  = float((grp["import_mw"]       * pct).sum()) if "import_mw"      in grp.columns else 0.0
            exp  = float((grp["export_mw"]        * pct).sum()) if "export_mw"      in grp.columns else 0.0
            net  = (gen + imp) - (cons + exp)
            zone_stats.append({
                "zone_id":         str(zone_id),
                "generation_mw":   round(gen,  2),
                "consumption_mw":  round(cons, 2),
                "net_flow_mw":     round(net,  2),
                "status":          _zone_status(net),
                "facility_count":  int(len(grp)),
            })

    # ── Flow lines ────────────────────────────────────────────────
    flow_features = _flow_features(combined)

    return {
        "pins":       {"type": "FeatureCollection", "features": pin_features},
        "flows":      {"type": "FeatureCollection", "features": flow_features},
        "zone_stats": zone_stats,
    }
