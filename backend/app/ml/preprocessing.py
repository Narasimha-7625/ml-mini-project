"""Data Preprocessing and Feature Scaling Module.

Uses scikit-learn's StandardScaler to standardize numerical features
so that distance calculations in K-Means are not dominated by features
with larger numerical ranges (e.g., AnnualIncome vs SpendingScore).
"""

from typing import List, Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


class CustomerPreprocessor:
    """Handles data validation, missing value imputation, and StandardScaler scaling."""

    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_stats: Dict[str, Dict[str, float]] = {}

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
        """Validates features, handles missing values, fits StandardScaler, and transforms data."""
        # Check that required features exist in dataframe
        missing_cols = [col for col in self.feature_names if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Features missing from dataset: {', '.join(missing_cols)}")

        # Create working copy of feature dataframe
        X_raw = df[self.feature_names].copy()

        # Convert to numeric, coercing errors to NaN
        for col in self.feature_names:
            X_raw[col] = pd.to_numeric(X_raw[col], errors="coerce")

        # Handle missing values via mean imputation
        imputed_counts = {}
        for col in self.feature_names:
            null_count = int(X_raw[col].isnull().sum())
            if null_count > 0:
                mean_val = float(X_raw[col].mean())
                if np.isnan(mean_val):
                    mean_val = 0.0
                X_raw[col] = X_raw[col].fillna(mean_val)
                imputed_counts[col] = null_count

        # Compute summary statistics
        self.feature_stats = {}
        for col in self.feature_names:
            self.feature_stats[col] = {
                "mean": float(X_raw[col].mean()),
                "std": float(X_raw[col].std(ddof=0)) if float(X_raw[col].std(ddof=0)) > 0 else 1.0,
                "min": float(X_raw[col].min()),
                "max": float(X_raw[col].max()),
            }

        # Fit StandardScaler and transform to z-scores: z = (x - mean) / std
        X_scaled = self.scaler.fit_transform(X_raw)
        self.is_fitted = True

        return X_scaled, X_raw

    def transform_single(self, input_dict: Dict[str, float]) -> np.ndarray:
        """Transforms a single customer input vector using the fitted StandardScaler.
        
        Crucial: uses the scaler fitted during training, without refitting.
        """
        if not self.is_fitted:
            raise RuntimeError("Preprocessor has not been fitted yet. Run clustering first.")

        # Ensure all features exist in input
        missing = [f for f in self.feature_names if f not in input_dict]
        if missing:
            raise ValueError(f"Missing input features for prediction: {', '.join(missing)}")

        vector = np.array([[float(input_dict[f]) for f in self.feature_names]], dtype=float)
        return self.scaler.transform(vector)

    def inverse_transform(self, X_scaled: np.ndarray) -> np.ndarray:
        """Converts standardized coordinates back to original physical feature units."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor has not been fitted yet.")
        return self.scaler.inverse_transform(X_scaled)
