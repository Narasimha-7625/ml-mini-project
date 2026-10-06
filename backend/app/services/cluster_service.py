"""Service layer managing application state: datasets, trained models, and caching."""

import os
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np

from ..ml.preprocessing import CustomerPreprocessor
from ..ml.clustering import CustomerClusterer
from ..ml.prediction import CustomerPredictor


DEFAULT_FEATURES = [
    "AnnualIncome",
    "SpendingScore",
    "PurchaseFrequency",
    "AverageOrderValue",
    "WebsiteVisits",
]


class ClusterService:
    """Singleton service maintaining current dataset, scaler, model, and metadata."""

    def __init__(self):
        self.df_raw: Optional[pd.DataFrame] = None
        self.df_clustered: Optional[pd.DataFrame] = None
        self.selected_features: List[str] = DEFAULT_FEATURES.copy()
        self.preprocessor: Optional[CustomerPreprocessor] = None
        self.clusterer: Optional[CustomerClusterer] = None
        self.predictor: Optional[CustomerPredictor] = None
        self.segment_profiles: List[Dict[str, Any]] = []
        self.k: int = 5
        self.inertia: float = 0.0
        self.last_elbow_curve: List[Dict[str, Any]] = []
        self.recommended_k: int = 5

        # Initialize with sample dataset
        self.load_sample_data()

    def get_sample_csv_path(self) -> str:
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "customers.csv"),
            os.path.join(os.getcwd(), "data", "customers.csv"),
            os.path.join(os.getcwd(), "backend", "data", "customers.csv"),
        ]
        for p in candidates:
            abs_p = os.path.abspath(p)
            if os.path.exists(abs_p):
                return abs_p
        return ""

    def load_sample_data(self) -> pd.DataFrame:
        """Loads default synthetic customer dataset."""
        sample_path = self.get_sample_csv_path()
        if not sample_path:
            raise FileNotFoundError("Sample dataset customers.csv not found.")

        self.df_raw = pd.read_csv(sample_path)
        # Ensure available default features match dataset
        available_numeric = [
            c for c in DEFAULT_FEATURES if c in self.df_raw.columns
        ]
        if available_numeric:
            self.selected_features = available_numeric
        else:
            self.selected_features = [
                c for c in self.df_raw.select_dtypes(include=[np.number]).columns
                if c not in ["CustomerID"]
            ]

        # Automatically train initial model with k=5
        self.run_clustering(k=5, features=self.selected_features)
        return self.df_raw

    def set_dataset_from_df(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Sets new dataframe from user upload, validates columns and missing values."""
        if df.empty:
            raise ValueError("The uploaded CSV file is empty.")

        self.df_raw = df.copy()
        numeric_cols = [
            c for c in df.select_dtypes(include=[np.number]).columns
            if c not in ["CustomerID", "Cluster"]
        ]
        if len(numeric_cols) < 2:
            raise ValueError("Dataset must contain at least 2 numerical features for clustering.")

        # Default features prioritizes known customer attributes if present
        chosen = [f for f in DEFAULT_FEATURES if f in numeric_cols]
        if len(chosen) < 2:
            chosen = numeric_cols[:5]

        self.selected_features = chosen
        # Run default clustering
        self.run_clustering(k=5, features=self.selected_features)

        missing_summary = {col: int(df[col].isnull().sum()) for col in df.columns}

        return {
            "total_rows": len(df),
            "columns": list(df.columns),
            "numeric_columns": numeric_cols,
            "selected_features": self.selected_features,
            "missing_values": missing_summary,
            "sample_rows": df.head(10).to_dict(orient="records"),
        }

    def compute_elbow(self, features: Optional[List[str]] = None) -> Dict[str, Any]:
        """Computes inertia curve across K=2 to 10."""
        if self.df_raw is None or self.df_raw.empty:
            raise ValueError("No dataset loaded.")

        feature_cols = features or self.selected_features
        preproc = CustomerPreprocessor(feature_cols)
        X_scaled, _ = preproc.fit_transform(self.df_raw)

        clusterer = CustomerClusterer(random_state=42, n_init=10)
        curve, recommended = clusterer.compute_elbow_curve(X_scaled, k_min=2, k_max=10)

        self.last_elbow_curve = curve
        self.recommended_k = recommended

        return {
            "elbow_curve": curve,
            "recommended_k": recommended,
            "explanation": (
                "The Elbow Method evaluates within-cluster inertia (sum of squared Euclidean distances to centroids). "
                "As K increases, inertia decreases. The recommended K highlights where marginal inertia reduction diminishes."
            )
        }

    def run_clustering(self, k: int, features: Optional[List[str]] = None) -> Dict[str, Any]:
        """Runs complete K-Means pipeline: scale -> fit -> profile -> assign."""
        if self.df_raw is None or self.df_raw.empty:
            raise ValueError("No dataset loaded.")

        if k < 2:
            raise ValueError("K must be at least 2.")
        if k > len(self.df_raw):
            raise ValueError("K cannot be greater than the number of customer records.")

        feature_cols = features or self.selected_features
        self.selected_features = feature_cols
        self.k = k

        # 1. Fit StandardScaler
        self.preprocessor = CustomerPreprocessor(feature_cols)
        X_scaled, df_features = self.preprocessor.fit_transform(self.df_raw)

        # 2. Fit KMeans
        self.clusterer = CustomerClusterer(random_state=42, n_init=10)
        labels, scaled_centroids, inertia = self.clusterer.fit(X_scaled, k, feature_cols)
        self.inertia = inertia

        # 3. Inverse transform centroids to natural units
        centroids_original = self.preprocessor.inverse_transform(scaled_centroids)

        # 4. Generate dynamic segment profiles & recommendations
        self.segment_profiles = self.clusterer.generate_segment_profiles(
            self.df_raw, labels, centroids_original, feature_cols
        )

        # 5. Attach cluster labels and segment names to dataframe
        df_out = self.df_raw.copy()
        df_out["Cluster"] = labels

        # Map cluster ID to segment name
        cluster_name_map = {p["cluster_id"]: p["segment_name"] for p in self.segment_profiles}
        df_out["Segment"] = df_out["Cluster"].map(cluster_name_map)
        self.df_clustered = df_out

        # 6. Initialize predictor
        self.predictor = CustomerPredictor(self.preprocessor, self.clusterer, self.segment_profiles)

        return self.get_summary()

    def predict_customer(self, customer_input: Dict[str, float]) -> Dict[str, Any]:
        """Predicts segment for a single customer using current fitted model and scaler."""
        if self.predictor is None:
            raise RuntimeError("Model is not trained. Please run clustering first.")
        return self.predictor.predict(customer_input)

    def get_summary(self) -> Dict[str, Any]:
        """Returns full dashboard summary payload."""
        if self.df_clustered is None or self.clusterer is None:
            return {}

        # High-level metrics
        total_customers = len(self.df_clustered)
        avg_income = (
            float(self.df_clustered["AnnualIncome"].mean())
            if "AnnualIncome" in self.df_clustered.columns
            else 0.0
        )
        avg_spending = (
            float(self.df_clustered["SpendingScore"].mean())
            if "SpendingScore" in self.df_clustered.columns
            else 0.0
        )

        # Highest and lowest spending segment
        sorted_by_spending = sorted(
            self.segment_profiles,
            key=lambda p: p["centroids"].get("SpendingScore", 0.0),
            reverse=True,
        )
        highest_spending_segment = sorted_by_spending[0]["segment_name"] if sorted_by_spending else "N/A"
        lowest_spending_segment = sorted_by_spending[-1]["segment_name"] if sorted_by_spending else "N/A"

        # Scatter plot sample points (AnnualIncome vs SpendingScore)
        scatter_points = []
        if "AnnualIncome" in self.df_clustered.columns and "SpendingScore" in self.df_clustered.columns:
            for _, row in self.df_clustered.iterrows():
                scatter_points.append({
                    "CustomerID": str(row.get("CustomerID", "")),
                    "x": float(row["AnnualIncome"]),
                    "y": float(row["SpendingScore"]),
                    "cluster": int(row["Cluster"]),
                    "segment": str(row["Segment"]),
                    "freq": float(row.get("PurchaseFrequency", 0)),
                    "aov": float(row.get("AverageOrderValue", 0)),
                })

        # Centroid scatter markers
        centroid_points = []
        for p in self.segment_profiles:
            centroid_points.append({
                "cluster": p["cluster_id"],
                "segment": p["segment_name"],
                "x": p["centroids"].get("AnnualIncome", 0.0),
                "y": p["centroids"].get("SpendingScore", 0.0),
                "color": p["color"],
            })

        return {
            "total_customers": total_customers,
            "k": self.k,
            "inertia": round(self.inertia, 2),
            "avg_income": round(avg_income, 2),
            "avg_spending": round(avg_spending, 2),
            "highest_spending_segment": highest_spending_segment,
            "lowest_spending_segment": lowest_spending_segment,
            "selected_features": self.selected_features,
            "profiles": self.segment_profiles,
            "scatter_points": scatter_points,
            "centroids": centroid_points,
            "feature_stats": self.preprocessor.feature_stats if self.preprocessor else {},
        }


# Global singleton instance
cluster_service = ClusterService()
