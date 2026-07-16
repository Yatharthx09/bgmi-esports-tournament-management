import re
from datetime import datetime

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(email):
    return bool(email) and bool(EMAIL_RE.match(email))


def require_fields(data, fields):
    """Return list of missing/blank field names."""
    missing = []
    for f in fields:
        val = data.get(f)
        if val is None or (isinstance(val, str) and not val.strip()):
            missing.append(f)
    return missing


def parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except (ValueError, AttributeError):
        return None
