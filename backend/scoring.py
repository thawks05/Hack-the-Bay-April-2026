"""
Project scoring engine.

Composite score = weighted sum of:
  efficiency (energy gain per MW)
  cost       (inverted — cheaper is better)
  speed      (inverted — faster is better)
  convenience (inverted disruption score)
"""

from backend.config import SCORE_WEIGHTS

# Mock project database — replace with RAG-retrieved projects as you build out
MOCK_PROJECTS = [
    {
        "project_id": "solar_canopy_01",
        "name": "Downtown Solar Canopy Network",
        "description": "Install solar canopies over parking lots and plazas in the Downtown Core.",
        "zone": "Downtown Core",
        "energy_gain_mw": 68,
        "cost_usd": 12_000_000,
        "implementation_months": 8,
        "disruption_score": 1,
        "tags": ["solar", "quick-win"],
    },
    {
        "project_id": "smart_bems_01",
        "name": "Smart Building Energy Management (BEMS)",
        "description": "Deploy AI-driven BEMS across major commercial buildings to cut demand 15%.",
        "zone": "Westshore",
        "energy_gain_mw": 45,
        "cost_usd": 4_200_000,
        "implementation_months": 5,
        "disruption_score": 1,
        "tags": ["efficiency", "quick-win"],
    },
    {
        "project_id": "battery_storage_01",
        "name": "Port Tampa Grid-Scale Battery Storage",
        "description": "200 MWh battery storage at Port Tampa to capture curtailment and smooth peak demand.",
        "zone": "Port Tampa",
        "energy_gain_mw": 0,
        "cost_usd": 32_000_000,
        "implementation_months": 18,
        "disruption_score": 2,
        "tags": ["storage", "resilience"],
    },
    {
        "project_id": "ev_charging_01",
        "name": "EV Charging + V2G Network",
        "description": "Citywide EV charging with vehicle-to-grid capability, turning parked cars into distributed storage.",
        "zone": "Multiple",
        "energy_gain_mw": 22,
        "cost_usd": 8_500_000,
        "implementation_months": 12,
        "disruption_score": 2,
        "tags": ["transport", "storage"],
    },
    {
        "project_id": "offshore_wind_01",
        "name": "Tampa Bay Offshore Wind Farm",
        "description": "5-turbine pilot offshore wind installation in Tampa Bay.",
        "zone": "Port Tampa",
        "energy_gain_mw": 150,
        "cost_usd": 95_000_000,
        "implementation_months": 48,
        "disruption_score": 4,
        "tags": ["wind", "large-scale"],
    },
    {
        "project_id": "ybor_microgrids_01",
        "name": "Ybor City Community Microgrid",
        "description": "Resilient neighbourhood microgrid with solar + storage for Ybor City.",
        "zone": "Ybor City",
        "energy_gain_mw": 18,
        "cost_usd": 6_100_000,
        "implementation_months": 10,
        "disruption_score": 2,
        "tags": ["solar", "resilience", "community"],
    },
]


def _normalise(value: float, min_v: float, max_v: float, invert: bool = False) -> float:
    """Scale value to 0–100. Invert so lower raw = higher score when needed."""
    if max_v == min_v:
        return 50.0
    norm = (value - min_v) / (max_v - min_v) * 100
    return 100 - norm if invert else norm


def score_projects(projects: list[dict] | None = None) -> list[dict]:
    """
    Score and rank projects. Uses MOCK_PROJECTS if no list supplied.
    Returns projects sorted by composite score descending.
    """
    items = projects if projects is not None else MOCK_PROJECTS

    gains = [p["energy_gain_mw"] for p in items]
    costs = [p["cost_usd"] for p in items]
    months = [p["implementation_months"] for p in items]
    disruptions = [p["disruption_score"] for p in items]

    scored = []
    for p in items:
        eff = _normalise(p["energy_gain_mw"], min(gains), max(gains))
        cost = _normalise(p["cost_usd"], min(costs), max(costs), invert=True)
        speed = _normalise(p["implementation_months"], min(months), max(months), invert=True)
        conv = _normalise(p["disruption_score"], min(disruptions), max(disruptions), invert=True)

        composite = (
            eff * SCORE_WEIGHTS["efficiency"]
            + cost * SCORE_WEIGHTS["cost"]
            + speed * SCORE_WEIGHTS["speed"]
            + conv * SCORE_WEIGHTS["convenience"]
        )

        scored.append(
            {
                **p,
                "scores": {
                    "efficiency": round(eff, 1),
                    "cost": round(cost, 1),
                    "speed": round(speed, 1),
                    "convenience": round(conv, 1),
                    "composite": round(composite, 1),
                },
            }
        )

    return sorted(scored, key=lambda x: x["scores"]["composite"], reverse=True)
