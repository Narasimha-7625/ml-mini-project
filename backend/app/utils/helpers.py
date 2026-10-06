"""Helper utilities for file handling, metric formatting, and mathematical conversions."""

from typing import Dict, Any
import numpy as np


def format_currency(value: float) -> str:
    """Formats numeric value as dollar amount."""
    return f"${round(value, 2):,.2f}"


def calculate_euclidean_distance(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Calculates Euclidean distance between two vectors."""
    return float(np.sqrt(np.sum((vec_a - vec_b) ** 2)))


def sanitize_dict_nan(data: Dict[str, Any]) -> Dict[str, Any]:
    """Replaces NaN and Infinite values in dictionary with safe JSON numbers."""
    cleaned = {}
    for k, v in data.items():
        if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
            cleaned[k] = 0.0
        else:
            cleaned[k] = v
    return cleaned
