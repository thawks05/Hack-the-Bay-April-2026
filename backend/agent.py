"""
Gemma 4 agent via Ollama.

The agent receives:
  - a system prompt with the current Tampa grid context
  - the user query
  - optional structured data summaries from uploaded CSVs

It returns a conversational response + any structured recommendations.
"""

import json
import ollama
from backend.config import OLLAMA_MODEL
from backend.scoring import score_projects

SYSTEM_PROMPT = """You are a government City Planning AI for the City of Tampa, Florida.
Your role is to analyze Downtown Tampa's energy grid and recommend sustainable energy projects.

You have access to:
- Current power budget data for Tampa's districts
- Energy inflow/outflow data (generation, consumption, imports, exports)
- Transmission & distribution loss figures
- Battery storage round-trip efficiency data
- Curtailment events
- A database of potential sustainable energy projects with cost, timeline, and efficiency scores

Scoring model for projects (higher = better recommendation):
- Energy Efficiency Gain: 35% weight
- Cost Efficiency (cheaper = higher score): 30% weight
- Implementation Speed (faster = higher score): 20% weight
- Low Disruption/Convenience: 15% weight

When recommending projects, always cite:
1. Estimated energy gain (MW)
2. Cost (USD)
3. Implementation timeline (months)
4. Why it scores well given the current grid data

Be concise, data-driven, and actionable. You are advising real city planners."""


def build_context_block(grid_summary: dict | None) -> str:
    """Build a rich text block from uploaded CSV data to inject into the prompt."""
    from backend.upload import get_uploaded_dataframes
    dfs = get_uploaded_dataframes()

    lines = ["\n--- UPLOADED ENERGY DATA ---"]

    if not dfs and not grid_summary:
        return ""

    if dfs:
        import pandas as pd
        combined = pd.concat(dfs, ignore_index=True)

        # Facility-level detail (cap at 40 rows to stay within context)
        display_cols = [c for c in [
            "facility_name", "zone_id", "source_type", "fuel_type",
            "capacity_mw", "generation_mw", "consumption_mw",
            "operating_status", "outage_risk",
        ] if c in combined.columns]

        lines.append(f"\nFacilities ({len(combined)} total):")
        for _, row in combined[display_cols].head(40).iterrows():
            parts = [f"{c}={row[c]}" for c in display_cols if str(row.get(c, "")) not in ("", "nan", "None")]
            lines.append("  " + ", ".join(parts))

        # Zone-level aggregates
        if "zone_id" in combined.columns:
            lines.append("\nZone aggregates:")
            for zone, grp in combined.groupby("zone_id"):
                gen = grp["generation_mw"].sum() if "generation_mw" in grp else 0
                cons = grp["consumption_mw"].sum() if "consumption_mw" in grp else 0
                lines.append(f"  {zone}: gen={gen:.1f} MW, cons={cons:.1f} MW, net={gen-cons:.1f} MW")

        # Fleet-wide totals
        gen_total = combined["generation_mw"].sum() if "generation_mw" in combined else 0
        cons_total = combined["consumption_mw"].sum() if "consumption_mw" in combined else 0
        lines.append(f"\nTotals: generation={gen_total:.1f} MW, consumption={cons_total:.1f} MW, net={gen_total-cons_total:.1f} MW")

    elif grid_summary:
        # Fallback to metadata summaries if dataframes unavailable
        for file_name, summary in grid_summary.items():
            lines.append(f"\nFile: {file_name} ({summary.get('file_type', 'unknown')}), rows={summary.get('rows','?')}")
            if summary.get("total_generation_mw") is not None:
                lines.append(f"  Generation={summary['total_generation_mw']} MW, Consumption={summary['total_consumption_mw']} MW")
            if summary.get("zones"):
                lines.append(f"  Zones: {', '.join(summary['zones'])}")

    lines.append("--- END DATA ---\n")
    return "\n".join(lines)


def ask_agent(query: str, grid_summary: dict | None = None) -> dict:
    """
    Send a query to Gemma 4 via Ollama.

    Returns:
      {
        "response": str,          # model's text response
        "recommendations": list,  # scored projects (always included)
      }
    """
    context = build_context_block(grid_summary)
    full_query = f"{context}{query}" if context else query

    try:
        result = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": full_query},
            ],
        )
        response_text = result["message"]["content"]
    except Exception as e:
        response_text = (
            f"[Agent error — is Ollama running with model '{OLLAMA_MODEL}'? "
            f"Run: ollama serve && ollama run {OLLAMA_MODEL}]\n\nError: {e}"
        )

    recommendations = score_projects()

    return {
        "response": response_text,
        "recommendations": recommendations[:5],  # top 5
    }


def build_roadmap(horizon_years: list[int], grid_summary: dict | None = None) -> dict:
    """
    Ask the agent to produce a phased roadmap for the given year horizons.
    """
    projects = score_projects()
    top_projects = [p["name"] for p in projects[:6]]

    query = (
        f"Create a phased energy transition roadmap for Downtown Tampa "
        f"across {', '.join(str(y) + '-year' for y in horizon_years)} horizons. "
        f"Available top-ranked projects: {json.dumps(top_projects)}. "
        f"For each horizon provide: milestone name, target renewable %, "
        f"projects to implement, estimated budget required, and key constraints remaining."
    )

    result = ask_agent(query, grid_summary)

    return {
        "horizons": horizon_years,
        "roadmap_narrative": result["response"],
        "top_projects": projects[:6],
    }
