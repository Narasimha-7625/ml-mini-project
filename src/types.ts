export interface CustomerRecord {
  CustomerID: string;
  Age: number;
  Gender: string;
  AnnualIncome: number;
  SpendingScore: number;
  PurchaseFrequency: number;
  AverageOrderValue: number;
  WebsiteVisits: number;
  CustomerLoyaltyYears: number;
  Cluster?: number;
  Segment?: string;
  [key: string]: any;
}

export interface SegmentProfile {
  cluster_id: number;
  segment_name: string;
  tag: string;
  color: string;
  customer_count: number;
  percentage: number;
  description: string;
  centroids: Record<string, number>;
  recommendations: string[];
}

export interface ScatterPoint {
  CustomerID: string;
  x: number;
  y: number;
  cluster: number;
  segment: string;
  freq: number;
  aov: number;
}

export interface CentroidPoint {
  cluster: number;
  segment: string;
  x: number;
  y: number;
  color: string;
}

export interface FeatureStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface DashboardSummary {
  total_customers: number;
  k: number;
  inertia: number;
  avg_income: number;
  avg_spending: number;
  highest_spending_segment: string;
  lowest_spending_segment: string;
  selected_features: string[];
  profiles: SegmentProfile[];
  scatter_points: ScatterPoint[];
  centroids: CentroidPoint[];
  feature_stats: Record<string, FeatureStats>;
}

export interface ElbowPoint {
  k: number;
  inertia: number;
}

export interface ElbowResponse {
  elbow_curve: ElbowPoint[];
  recommended_k: number;
  explanation: string;
}

export interface PredictionDistance {
  cluster_id: number;
  segment_name: string;
  tag: string;
  color: string;
  distance: number;
}

export interface PredictionResult {
  predicted_cluster: number;
  segment_name: string;
  tag: string;
  color: string;
  description: string;
  recommendations: string[];
  centroid_values: Record<string, number>;
  distances_to_all_centroids: PredictionDistance[];
  explanation: string;
}

export interface CustomerInputData {
  Age: number;
  AnnualIncome: number;
  SpendingScore: number;
  PurchaseFrequency: number;
  AverageOrderValue: number;
  WebsiteVisits: number;
  CustomerLoyaltyYears: number;
}
