"""K-Means Clustering and Customer Segment Interpretation Module.

Executes:
1. Elbow Method inertia calculation across K=2 through K=10.
2. Scikit-learn KMeans training with random_state=42 and n_init=10.
3. Centroid extraction and reverse scaling.
4. Heuristic segment labeling based on multi-dimensional centroid characteristics.
5. Actionable marketing recommendations for each discovered customer segment.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans


class CustomerClusterer:
    """Manages K-Means training, Elbow analysis, and cluster profiling."""

    def __init__(self, random_state: int = 42, n_init: int = 10):
        self.random_state = random_state
        self.n_init = n_init
        self.model: KMeans = None
        self.k: int = 0
        self.feature_names: List[str] = []

    def compute_elbow_curve(
        self, X_scaled: np.ndarray, k_min: int = 2, k_max: int = 10
    ) -> List[Dict[str, Any]]:
        """Calculates inertia (Within-Cluster Sum of Squares) for K in [k_min, k_max].
        
        Inertia formula: Sum of squared Euclidean distances of samples to their closest cluster center.
        """
        n_samples = X_scaled.shape[0]
        actual_max = min(k_max, n_samples - 1)
        results = []

        for k in range(k_min, actual_max + 1):
            km = KMeans(n_clusters=k, random_state=self.random_state, n_init=self.n_init)
            km.fit(X_scaled)
            results.append({
                "k": k,
                "inertia": round(float(km.inertia_), 2)
            })

        # Calculate heuristic recommended K using distance from secant line (Elbow point)
        if len(results) >= 3:
            p1 = np.array([results[0]["k"], results[0]["inertia"]])
            p2 = np.array([results[-1]["k"], results[-1]["inertia"]])
            max_dist = -1.0
            best_k = results[0]["k"]

            for pt in results:
                p0 = np.array([pt["k"], pt["inertia"]])
                # Distance of point p0 to line between p1 and p2
                line_vec = p2 - p1
                norm_line = np.linalg.norm(line_vec)
                if norm_line > 0:
                    dist = np.abs(np.cross(line_vec, p1 - p0)) / norm_line
                    if dist > max_dist:
                        max_dist = dist
                        best_k = pt["k"]
        else:
            best_k = 4

        return results, best_k

    def fit(
        self,
        X_scaled: np.ndarray,
        k: int,
        feature_names: List[str]
    ) -> Tuple[np.ndarray, np.ndarray, float]:
        """Fits KMeans model on scaled data and returns cluster labels, scaled centroids, and inertia."""
        self.k = k
        self.feature_names = feature_names
        self.model = KMeans(n_clusters=k, random_state=self.random_state, n_init=self.n_init)
        labels = self.model.fit_predict(X_scaled)
        scaled_centroids = self.model.cluster_centers_
        inertia = float(self.model.inertia_)
        return labels, scaled_centroids, inertia

    def generate_segment_profiles(
        self,
        df_raw: pd.DataFrame,
        labels: np.ndarray,
        centroids_original: np.ndarray,
        feature_names: List[str]
    ) -> List[Dict[str, Any]]:
        """Generates dynamic semantic labels, statistical summaries, and recommendations.
        
        Rather than blind static strings, it evaluates cluster centroid ratios
        against overall dataset averages (income, spending, purchase frequency, order value).
        """
        profiles: List[Dict[str, Any]] = []
        overall_means = {col: float(df_raw[col].mean()) for col in feature_names}
        total_customers = len(labels)

        for cluster_id in range(self.k):
            mask = (labels == cluster_id)
            cluster_count = int(np.sum(mask))
            cluster_pct = round((cluster_count / total_customers) * 100, 1)

            # Centroid values for this cluster
            centroid_vals = {
                feature_names[i]: float(centroids_original[cluster_id][i])
                for i in range(len(feature_names))
            }

            # Assess relative standing (High / Moderate / Low) compared to overall means
            income_ratio = (
                centroid_vals.get("AnnualIncome", overall_means.get("AnnualIncome", 1.0))
                / (overall_means.get("AnnualIncome", 1.0) or 1.0)
            )
            spending_ratio = (
                centroid_vals.get("SpendingScore", overall_means.get("SpendingScore", 1.0))
                / (overall_means.get("SpendingScore", 1.0) or 1.0)
            )
            freq_ratio = (
                centroid_vals.get("PurchaseFrequency", overall_means.get("PurchaseFrequency", 1.0))
                / (overall_means.get("PurchaseFrequency", 1.0) or 1.0)
            )
            aov_ratio = (
                centroid_vals.get("AverageOrderValue", overall_means.get("AverageOrderValue", 1.0))
                / (overall_means.get("AverageOrderValue", 1.0) or 1.0)
            )

            # Determine dynamic segment naming based on multidimensional traits
            if income_ratio >= 1.15 and spending_ratio >= 1.15:
                segment_name = "High-Value Loyal Customers"
                tag = "VIP Segment"
                color = "#10B981" # Emerald
                description = "Affluent customers with high disposable income and strong willingness to spend across frequent orders."
                recommendations = [
                    "Exclusive VIP loyalty tiers and invitations to private shopping events.",
                    "Personalized concierge service and early access to high-ticket releases.",
                    "Premium cross-selling with luxury bundles and white-glove warranty.",
                    "Dedicated account manager or express priority customer support."
                ]
            elif income_ratio >= 1.15 and spending_ratio < 0.85:
                segment_name = "High-Income Low-Spending Customers"
                tag = "Careful Savers"
                color = "#3B82F6" # Blue
                description = "High financial capacity, yet cautious with spending; values durability, quality assurance, and proof of value."
                recommendations = [
                    "Value-justification campaigns highlighting product durability, ROI, and craftsmanship.",
                    "Trial guarantees, free return assurances, and verified buyer reviews.",
                    "Curated educational guides to highlight premium product utility over flashy discounts.",
                    "Targeted incentives on high-utility staple items rather than impulse buys."
                ]
            elif income_ratio < 0.85 and spending_ratio >= 1.15:
                segment_name = "Budget-Conscious High-Spending Customers"
                tag = "Aspirational Trendsetters"
                color = "#F59E0B" # Amber
                description = "Modest or younger income demographic demonstrating high brand affinity and aggressive purchase engagement."
                recommendations = [
                    "Flexible Buy Now Pay Later (BNPL) payment terms and installment options.",
                    "Time-limited flash sales, trend-driven digital lookbooks, and gamified rewards.",
                    "Social media influencer collaborations and viral unboxing campaigns.",
                    "Referral bonus credits and points-for-reviews community incentives."
                ]
            elif income_ratio < 0.85 and spending_ratio < 0.85:
                segment_name = "Low-Engagement Budget Customers"
                tag = "At-Risk / Occasional"
                color = "#EF4444" # Rose / Red
                description = "Lower income and low spending activity; purchases primarily out of essential need or steep clearance discounts."
                recommendations = [
                    "Re-engagement automated email journeys with clearance or entry-level discounts.",
                    "High-value entry bundles and free shipping thresholds.",
                    "Streamlined, low-friction checkout experience with coupon reminders.",
                    "Seasonal holiday promotions focusing on essential high-utility products."
                ]
            elif freq_ratio >= 1.2:
                segment_name = "Frequent Steady Shoppers"
                tag = "Regular Customers"
                color = "#8B5CF6" # Purple
                description = "Reliable repeat purchasers with balanced income and spending patterns forming the predictable revenue backbone."
                recommendations = [
                    "Subscription models and scheduled replenishment reminders for everyday items.",
                    "Tiered milestone loyalty rewards (e.g., free gift on every 5th order).",
                    "Cross-category discovery surveys with targeted coupon incentives.",
                    "Volume discounts on bundle packages."
                ]
            else:
                segment_name = "Balanced Core Customers"
                tag = "Middle-Market Baseline"
                color = "#6366F1" # Indigo
                description = "Moderate income and balanced spending scores representing standard mainstream customer behavior."
                recommendations = [
                    "Targeted seasonal promotions and personalized category recommendations.",
                    "Moderate upsell incentives (e.g., 'Add $15 more for free shipping').",
                    "Standard loyalty point accrual with easy redemption options.",
                    "Newsletter highlights featuring trending and bestselling items."
                ]

            profiles.append({
                "cluster_id": cluster_id,
                "segment_name": segment_name,
                "tag": tag,
                "color": color,
                "customer_count": cluster_count,
                "percentage": cluster_pct,
                "description": description,
                "centroids": {k: round(v, 2) for k, v in centroid_vals.items()},
                "recommendations": recommendations,
            })

        return profiles
