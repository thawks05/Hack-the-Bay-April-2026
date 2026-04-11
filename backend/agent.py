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
    """Build a text block from uploaded CSV summaries to inject into the prompt."""
    if not grid_summary:
        return ""

    lines = ["\n--- CURRENT TAMPA GRID DATA ---"]
    for file_name, summary in grid_summary.items():
        lines.append(f"\nFile: {file_name} ({summary.get('file_type', 'unknown')})")
        lines.append(f"  Rows: {summary.get('rows', '?')}")
        if summary.get("total_generation_mw") is not None:
            lines.append(f"  Total Generation: {summary['total_generation_mw']} MW")
        if summary.get("total_consumption_mw") is not None:
            lines.append(f"  Total Consumption: {summary['total_consumption_mw']} MW")
        if summary.get("zones"):
            lines.append(f"  Zones: {', '.join(summary['zones'])}")
    lines.append("--- END GRID DATA ---\n")
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
