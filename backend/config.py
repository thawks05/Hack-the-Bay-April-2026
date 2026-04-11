import os

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4:e2b")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "uploads")

# Tampa districts for map rendering
TAMPA_DISTRICTS = [
    "Downtown Core",
    "Channel District",
    "Ybor City",
    "West Tampa",
    "South Tampa",
    "New Tampa",
    "Port Tampa",
    "Westshore",
    "MacDill AFB",
]

# Scoring weights for project recommendations
SCORE_WEIGHTS = {
    "efficiency": 0.35,
    "cost": 0.30,
    "speed": 0.20,
    "convenience": 0.15,
}
