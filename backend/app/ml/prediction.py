"""New Customer Prediction Module.

Demonstrates inference on incoming customer profile:
1. Scales raw input using the pre-fitted StandardScaler.
2. Calculates Euclidean distance: d(x, c) = sqrt(sum((x_i - c_i)^2)) to each centroid.
3. Assigns to cluster with minimal Euclidean distance: cluster = argmin_k(d(x, c_k)).
4. Returns step-by-step distances, predicted cluster, profile, and business actions.
"""

from typing import Dict, Any, List
import numpy as np
from .preprocessing import CustomerPreprocessor
from .clustering import CustomerClusterer


class CustomerPredictor:
    """Handles inference for new customer demographic and behavioral data."""

    def __init__(self, preprocessor: CustomerPreprocessor, clusterer: CustomerClusterer, segment_profiles: List[Dict[str, Any]]):
        self.preprocessor = preprocessor
        self.clusterer = clusterer
        self.segment_profiles = segment_profiles

    def predict(self, customer_input: Dict[str, float]) -> Dict[str, Any]:
        """Predicts the segment for a single customer record."""
        if not self.preprocessor.is_fitted:
            raise RuntimeError("Model pipeline has not been trained yet. Please run clustering first.")

        # Transform single record using existing fitted scaler
        x_scaled = self.preprocessor.transform_single(customer_input) # shape: (1, n_features)

        # Get fitted cluster centroids in scaled space
        scaled_centroids = self.clusterer.model.cluster_centers_ # shape: (k, n_features)

        # Calculate Euclidean distances to all centroids
        distances = []
        for c_idx in range(len(scaled_centroids)):
            centroid_vec = scaled_centroids[c_idx]
            # Euclidean distance formula: sqrt(sum((x - c)^2))
            diff = x_scaled[0] - centroid_vec
            dist = float(np.sqrt(np.sum(diff ** 2)))
            profile = next((p for p in self.segment_profiles if p["cluster_id"] == c_idx), None)
            distances.append({
                "cluster_id": c_idx,
                "segment_name": profile["segment_name"] if profile else f"Cluster {c_idx}",
                "tag": profile["tag"] if profile else "",
                "color": profile["color"] if profile else "#6366F1",
                "distance": round(dist, 4),
            })

        # Predicted cluster is the argmin of Euclidean distance
        best_match = min(distances, key=lambda item: item["distance"])
        predicted_cluster = best_match["cluster_id"]
        predicted_profile = next((p for p in self.segment_profiles if p["cluster_id"] == predicted_cluster), None)

        return {
            "predicted_cluster": predicted_cluster,
            "segment_name": predicted_profile["segment_name"] if predicted_profile else f"Cluster {predicted_cluster}",
            "tag": predicted_profile["tag"] if predicted_profile else "",
            "color": predicted_profile["color"] if predicted_profile else "#6366F1",
            "description": predicted_profile["description"] if predicted_profile else "",
            "recommendations": predicted_profile["recommendations"] if predicted_profile else [],
            "centroid_values": predicted_profile["centroids"] if predicted_profile else {},
            "distances_to_all_centroids": distances,
            "explanation": (
                f"Customer was standardized using the training StandardScaler and mapped to scaled feature coordinates. "
                f"Nearest centroid is Cluster {predicted_cluster} ('{best_match['segment_name']}') with Euclidean distance = {best_match['distance']}."
            ),
        }
