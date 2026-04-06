# services/priority_service.py
# ============================================================
# Keyword-based priority detection
# This is a simple rule-based classifier — no ML library needed.
# You could later replace this with a real ML model (sklearn, etc.)
# ============================================================

# Keywords that map to each priority level
# Add or remove keywords as needed for your use-case

HIGH_KEYWORDS = [
    'accident', 'fire', 'flood', 'emergency', 'danger',
    'collapse', 'explosion', 'injury', 'injured', 'dead',
    'death', 'bleeding', 'urgent', 'critical', 'hazard',
    'electrocution', 'gas leak', 'drowning', 'hit and run',
]

MEDIUM_KEYWORDS = [
    'garbage', 'trash', 'waste', 'traffic', 'streetlight',
    'pothole', 'leak', 'noise', 'sewage', 'broken', 'damage',
    'vandalism', 'graffiti', 'stray', 'illegal', 'blocked',
    'overflow', 'signal', 'pest', 'rodent', 'encroachment',
]

LOW_KEYWORDS = [
    'suggestion', 'feedback', 'improvement', 'request',
    'idea', 'recommend', 'enhance', 'propose', 'minor',
    'cosmetic', 'wish', 'future',
]


def detect_priority(title: str, description: str) -> str:
    """
    Detect priority from the issue title and description.

    Logic:
    1. Combine title + description into a single lowercase string.
    2. Check for HIGH keywords first (most severe).
    3. Then check MEDIUM keywords.
    4. Default to LOW if nothing specific found.

    Returns:
        'High', 'Medium', or 'Low'
    """
    # Combine and lowercase for case-insensitive matching
    combined = (title + ' ' + description).lower()

    # ── Check HIGH priority keywords ──
    for keyword in HIGH_KEYWORDS:
        if keyword in combined:
            return 'High'

    # ── Check MEDIUM priority keywords ──
    for keyword in MEDIUM_KEYWORDS:
        if keyword in combined:
            return 'Medium'

    # ── Default to LOW ──
    return 'Low'


def get_priority_color(priority: str) -> str:
    """Return a hex color string for a given priority level."""
    colors = {
        'High':   '#ff4d6d',
        'Medium': '#ffb647',
        'Low':    '#3ecf8e',
    }
    return colors.get(priority, '#7a84a0')
