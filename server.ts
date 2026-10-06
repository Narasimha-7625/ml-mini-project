import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

// --- DATA STRUCTURES & MATH UTILITIES ---

interface CustomerRecord {
  CustomerID: string;
  Age: number;
  Gender: string;
  AnnualIncome: number;
  SpendingScore: number;
  PurchaseFrequency: number;
  AverageOrderValue: number;
  WebsiteVisits: number;
  CustomerLoyaltyYears: number;
  [key: string]: any;
}

interface FeatureStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

interface SegmentProfile {
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

const DEFAULT_FEATURES = [
  'AnnualIncome',
  'SpendingScore',
  'PurchaseFrequency',
  'AverageOrderValue',
  'WebsiteVisits',
];

// Seeded random generator (PRNG) for reproducibility
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// StandardScaler implementation
class StandardScaler {
  means: Record<string, number> = {};
  stds: Record<string, number> = {};
  stats: Record<string, FeatureStats> = {};
  features: string[] = [];

  fit(data: CustomerRecord[], features: string[]) {
    this.features = features;
    for (const f of features) {
      const vals = data.map((d) => Number(d[f]) || 0);
      const n = vals.length;
      const sum = vals.reduce((acc, v) => acc + v, 0);
      const mean = sum / (n || 1);
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n || 1);
      const std = Math.sqrt(variance) || 1.0;
      const min = Math.min(...vals);
      const max = Math.max(...vals);

      this.means[f] = mean;
      this.stds[f] = std;
      this.stats[f] = { mean, std, min, max };
    }
  }

  transform(row: Record<string, any>): number[] {
    return this.features.map((f) => {
      const val = Number(row[f]) || 0;
      return (val - this.means[f]) / this.stds[f];
    });
  }

  transformAll(data: CustomerRecord[]): number[][] {
    return data.map((d) => this.transform(d));
  }

  inverseTransformVector(vector: number[]): Record<string, number> {
    const res: Record<string, number> = {};
    this.features.forEach((f, idx) => {
      res[f] = vector[idx] * this.stds[f] + this.means[f];
    });
    return res;
  }
}

// K-Means implementation with k-means++ seeding
class KMeansModel {
  k: number;
  features: string[];
  centroids: number[][] = []; // in scaled space
  labels: number[] = [];
  inertia: number = 0;

  constructor(k: number, features: string[]) {
    this.k = k;
    this.features = features;
  }

  fit(X: number[][], seed: number = 42) {
    const n = X.length;
    const d = X[0].length;
    const rng = mulberry32(seed);

    // K-Means++ initialization
    const initialCentroids: number[][] = [];
    const firstIdx = Math.floor(rng() * n);
    initialCentroids.push([...X[firstIdx]]);

    for (let c = 1; c < this.k; c++) {
      const distances: number[] = [];
      let totalDistSq = 0;
      for (let i = 0; i < n; i++) {
        let minDistSq = Infinity;
        for (const cent of initialCentroids) {
          let distSq = 0;
          for (let dim = 0; dim < d; dim++) {
            distSq += Math.pow(X[i][dim] - cent[dim], 2);
          }
          if (distSq < minDistSq) minDistSq = distSq;
        }
        distances.push(minDistSq);
        totalDistSq += minDistSq;
      }

      // Sample next centroid with probability proportional to D(x)^2
      const target = rng() * totalDistSq;
      let cumSum = 0;
      let chosenIdx = 0;
      for (let i = 0; i < n; i++) {
        cumSum += distances[i];
        if (cumSum >= target) {
          chosenIdx = i;
          break;
        }
      }
      initialCentroids.push([...X[chosenIdx]]);
    }

    let centroids = initialCentroids;
    let labels = new Array(n).fill(0);
    const maxIter = 100;
    const tolerance = 1e-4;

    for (let iter = 0; iter < maxIter; iter++) {
      // Step 1: Assign each point to nearest centroid
      let changed = false;
      for (let i = 0; i < n; i++) {
        let bestCluster = 0;
        let minDistSq = Infinity;
        for (let c = 0; c < this.k; c++) {
          let distSq = 0;
          for (let dim = 0; dim < d; dim++) {
            distSq += Math.pow(X[i][dim] - centroids[c][dim], 2);
          }
          if (distSq < minDistSq) {
            minDistSq = distSq;
            bestCluster = c;
          }
        }
        if (labels[i] !== bestCluster) {
          labels[i] = bestCluster;
          changed = true;
        }
      }

      // Step 2: Recalculate centroids
      const newCentroids: number[][] = Array.from({ length: this.k }, () => new Array(d).fill(0));
      const counts = new Array(this.k).fill(0);

      for (let i = 0; i < n; i++) {
        const c = labels[i];
        counts[c]++;
        for (let dim = 0; dim < d; dim++) {
          newCentroids[c][dim] += X[i][dim];
        }
      }

      let maxShift = 0;
      for (let c = 0; c < this.k; c++) {
        if (counts[c] > 0) {
          for (let dim = 0; dim < d; dim++) {
            newCentroids[c][dim] /= counts[c];
          }
        } else {
          // If empty cluster, re-seed from random point
          const randIdx = Math.floor(rng() * n);
          newCentroids[c] = [...X[randIdx]];
        }

        let shift = 0;
        for (let dim = 0; dim < d; dim++) {
          shift += Math.pow(newCentroids[c][dim] - centroids[c][dim], 2);
        }
        if (shift > maxShift) maxShift = shift;
      }

      centroids = newCentroids;
      if (maxShift < tolerance && !changed) break;
    }

    // Calculate total Inertia (sum of squared Euclidean distances to closest centroid)
    let totalInertia = 0;
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      let distSq = 0;
      for (let dim = 0; dim < d; dim++) {
        distSq += Math.pow(X[i][dim] - centroids[c][dim], 2);
      }
      totalInertia += distSq;
    }

    this.centroids = centroids;
    this.labels = labels;
    this.inertia = totalInertia;
  }
}

// Generate dynamic segment profiles & recommendations
function generateSegmentProfiles(
  rawDataset: CustomerRecord[],
  labels: number[],
  k: number,
  scaler: StandardScaler,
  model: KMeansModel
): SegmentProfile[] {
  const profiles: SegmentProfile[] = [];
  const total = rawDataset.length || 1;

  // Global feature means
  const globalMeans: Record<string, number> = {};
  for (const f of scaler.features) {
    const sum = rawDataset.reduce((acc, d) => acc + (Number(d[f]) || 0), 0);
    globalMeans[f] = sum / total;
  }

  for (let c = 0; c < k; c++) {
    const count = labels.filter((l) => l === c).length;
    const pct = Math.round((count / total) * 1000) / 10;
    const centroidRaw = scaler.inverseTransformVector(model.centroids[c]);

    const incomeRatio =
      (centroidRaw['AnnualIncome'] || globalMeans['AnnualIncome'] || 1) /
      (globalMeans['AnnualIncome'] || 1);
    const spendingRatio =
      (centroidRaw['SpendingScore'] || globalMeans['SpendingScore'] || 1) /
      (globalMeans['SpendingScore'] || 1);
    const freqRatio =
      (centroidRaw['PurchaseFrequency'] || globalMeans['PurchaseFrequency'] || 1) /
      (globalMeans['PurchaseFrequency'] || 1);

    let segmentName = 'Balanced Core Customers';
    let tag = 'Middle-Market Baseline';
    let color = '#6366F1';
    let description = 'Moderate income and balanced spending scores representing standard mainstream customer behavior.';
    let recommendations = [
      'Targeted seasonal promotions and personalized category recommendations.',
      'Moderate upsell incentives (e.g. "Add $15 more for free delivery").',
      'Standard loyalty points accrual with simple instant redemption.',
      'Weekly newsletter highlights featuring bestsellers and curated collections.',
    ];

    if (incomeRatio >= 1.15 && spendingRatio >= 1.15) {
      segmentName = 'High-Value Loyal Customers';
      tag = 'VIP Segment';
      color = '#10B981';
      description = 'Affluent customers with high disposable income and strong willingness to spend across frequent orders.';
      recommendations = [
        'Exclusive VIP loyalty tiers and invitations to private shopping events.',
        'Personalized concierge service and early access to high-ticket releases.',
        'Premium cross-selling with luxury bundles and white-glove warranty.',
        'Dedicated account manager or express priority customer support.',
      ];
    } else if (incomeRatio >= 1.15 && spendingRatio < 0.85) {
      segmentName = 'High-Income Low-Spending Customers';
      tag = 'Careful Savers';
      color = '#3B82F6';
      description = 'High financial capacity, yet cautious with spending; values durability, quality assurance, and proof of value.';
      recommendations = [
        'Value-justification campaigns highlighting product durability, ROI, and craftsmanship.',
        'Trial guarantees, free return assurances, and verified buyer reviews.',
        'Curated educational guides to highlight premium product utility over flashy discounts.',
        'Targeted incentives on high-utility staple items rather than impulse buys.',
      ];
    } else if (incomeRatio < 0.85 && spendingRatio >= 1.15) {
      segmentName = 'Budget-Conscious High-Spending Customers';
      tag = 'Aspirational Trendsetters';
      color = '#F59E0B';
      description = 'Modest or younger income demographic demonstrating high brand affinity and aggressive purchase engagement.';
      recommendations = [
        'Flexible Buy Now Pay Later (BNPL) payment terms and installment options.',
        'Time-limited flash sales, trend-driven digital lookbooks, and gamified rewards.',
        'Social media influencer collaborations and viral unboxing campaigns.',
        'Referral bonus credits and points-for-reviews community incentives.',
      ];
    } else if (incomeRatio < 0.85 && spendingRatio < 0.85) {
      segmentName = 'Low-Engagement Budget Customers';
      tag = 'At-Risk / Occasional';
      color = '#EF4444';
      description = 'Lower income and low spending activity; purchases primarily out of essential need or steep clearance discounts.';
      recommendations = [
        'Re-engagement automated email journeys with clearance or entry-level discounts.',
        'High-value entry bundles and free shipping thresholds.',
        'Streamlined, low-friction checkout experience with coupon reminders.',
        'Seasonal holiday promotions focusing on essential high-utility products.',
      ];
    } else if (freqRatio >= 1.2) {
      segmentName = 'Frequent Steady Shoppers';
      tag = 'Regular Customers';
      color = '#8B5CF6';
      description = 'Reliable repeat purchasers with balanced income and spending patterns forming the predictable revenue backbone.';
      recommendations = [
        'Subscription models and scheduled replenishment reminders for everyday items.',
        'Tiered milestone loyalty rewards (e.g. free gift on every 5th order).',
        'Cross-category discovery surveys with targeted coupon incentives.',
        'Volume discounts on bundle packages.',
      ];
    }

    const roundedCentroids: Record<string, number> = {};
    for (const key of Object.keys(centroidRaw)) {
      roundedCentroids[key] = Math.round(centroidRaw[key] * 100) / 100;
    }

    profiles.push({
      cluster_id: c,
      segment_name: segmentName,
      tag,
      color,
      customer_count: count,
      percentage: pct,
      description,
      centroids: roundedCentroids,
      recommendations,
    });
  }

  return profiles;
}

// Parse CSV string into array of records
function parseCsv(text: string): CustomerRecord[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const records: CustomerRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < headers.length) continue;
    const row: any = {};
    headers.forEach((h, idx) => {
      const val = parts[idx];
      const num = Number(val);
      row[h] = isNaN(num) || val === '' ? val : num;
    });
    records.push(row);
  }
  return records;
}

// Global in-memory state
let currentDataset: CustomerRecord[] = [];
let currentFeatures: string[] = [...DEFAULT_FEATURES];
let currentScaler = new StandardScaler();
let currentModel = new KMeansModel(5, currentFeatures);
let currentProfiles: SegmentProfile[] = [];
let currentClusteredData: (CustomerRecord & { Cluster: number; Segment: string })[] = [];
let currentK = 5;

// Load default sample dataset
function loadInitialSample() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'data', 'customers.csv'),
    path.resolve(process.cwd(), 'backend', 'data', 'customers.csv'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const text = fs.readFileSync(p, 'utf-8');
      const records = parseCsv(text);
      if (records.length > 0) {
        currentDataset = records;
        break;
      }
    }
  }

  if (currentDataset.length > 0) {
    runClusteringPipeline(5, currentFeatures);
  }
}

function runClusteringPipeline(k: number, features: string[]) {
  currentK = k;
  currentFeatures = features;
  currentScaler = new StandardScaler();
  currentScaler.fit(currentDataset, currentFeatures);

  const X_scaled = currentScaler.transformAll(currentDataset);
  currentModel = new KMeansModel(k, currentFeatures);
  currentModel.fit(X_scaled, 42);

  currentProfiles = generateSegmentProfiles(
    currentDataset,
    currentModel.labels,
    k,
    currentScaler,
    currentModel
  );

  const profileMap = new Map(currentProfiles.map((p) => [p.cluster_id, p.segment_name]));
  currentClusteredData = currentDataset.map((row, idx) => {
    const cluster = currentModel.labels[idx];
    return {
      ...row,
      Cluster: cluster,
      Segment: profileMap.get(cluster) || `Cluster ${cluster}`,
    };
  });
}

function getSummaryPayload() {
  const total = currentClusteredData.length;
  const avgIncome =
    currentClusteredData.reduce((acc, c) => acc + (Number(c.AnnualIncome) || 0), 0) / (total || 1);
  const avgSpending =
    currentClusteredData.reduce((acc, c) => acc + (Number(c.SpendingScore) || 0), 0) / (total || 1);

  const sortedProfiles = [...currentProfiles].sort(
    (a, b) => (b.centroids.SpendingScore || 0) - (a.centroids.SpendingScore || 0)
  );

  const scatterPoints = currentClusteredData.map((d) => ({
    CustomerID: d.CustomerID,
    x: Number(d.AnnualIncome) || 0,
    y: Number(d.SpendingScore) || 0,
    cluster: d.Cluster,
    segment: d.Segment,
    freq: Number(d.PurchaseFrequency) || 0,
    aov: Number(d.AverageOrderValue) || 0,
  }));

  const centroids = currentProfiles.map((p) => ({
    cluster: p.cluster_id,
    segment: p.segment_name,
    x: p.centroids.AnnualIncome || 0,
    y: p.centroids.SpendingScore || 0,
    color: p.color,
  }));

  return {
    total_customers: total,
    k: currentK,
    inertia: Math.round(currentModel.inertia * 100) / 100,
    avg_income: Math.round(avgIncome * 100) / 100,
    avg_spending: Math.round(avgSpending * 100) / 100,
    highest_spending_segment: sortedProfiles[0]?.segment_name || 'N/A',
    lowest_spending_segment: sortedProfiles[sortedProfiles.length - 1]?.segment_name || 'N/A',
    selected_features: currentFeatures,
    profiles: currentProfiles,
    scatter_points: scatterPoints,
    centroids,
    feature_stats: currentScaler.stats,
  };
}

// Compute Elbow curve across K=2..10
function computeElbowCurve(features: string[]) {
  const scaler = new StandardScaler();
  scaler.fit(currentDataset, features);
  const X_scaled = scaler.transformAll(currentDataset);

  const curve: { k: number; inertia: number }[] = [];
  const maxK = Math.min(10, currentDataset.length - 1);

  for (let k = 2; k <= maxK; k++) {
    const km = new KMeansModel(k, features);
    km.fit(X_scaled, 42);
    curve.push({
      k,
      inertia: Math.round(km.inertia * 100) / 100,
    });
  }

  // Find elbow point using distance to secant line
  let recommendedK = 4;
  if (curve.length >= 3) {
    const p1 = [curve[0].k, curve[0].inertia];
    const p2 = [curve[curve.length - 1].k, curve[curve.length - 1].inertia];
    const lineVec = [p2[0] - p1[0], p2[1] - p1[1]];
    const lineLen = Math.sqrt(lineVec[0] ** 2 + lineVec[1] ** 2);
    let maxDist = -1;

    for (const pt of curve) {
      const v = [pt.k - p1[0], pt.inertia - p1[1]];
      // 2D cross product: v[0]*lineVec[1] - v[1]*lineVec[0]
      const dist = Math.abs(v[0] * lineVec[1] - v[1] * lineVec[0]) / lineLen;
      if (dist > maxDist) {
        maxDist = dist;
        recommendedK = pt.k;
      }
    }
  }

  return {
    elbow_curve: curve,
    recommended_k: recommendedK,
    explanation:
      'The Elbow Method helps identify a suitable number of clusters by observing where the reduction in inertia begins to slow down.',
  };
}

// --- EXPRESS APP SETUP ---
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.text({ limit: '10mb', type: ['text/*', 'application/csv'] }));

  // Load sample on boot
  loadInitialSample();

  // API ROUTES
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'Customer Segmentation K-Means ML Engine',
      k_clusters: currentK,
      features: currentFeatures,
      records: currentDataset.length,
    });
  });

  app.get('/api/sample-data', (req, res) => {
    try {
      loadInitialSample();
      res.json({
        success: true,
        message: 'Sample customer dataset loaded successfully.',
        summary: getSummaryPayload(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/upload', (req, res) => {
    try {
      let csvText = '';
      if (typeof req.body === 'string') {
        csvText = req.body;
      } else if (req.body && typeof req.body.csv === 'string') {
        csvText = req.body.csv;
      } else {
        return res.status(400).json({ error: 'Please provide CSV content.' });
      }

      const records = parseCsv(csvText);
      if (records.length === 0) {
        return res.status(400).json({ error: 'Uploaded CSV has no valid rows.' });
      }

      const allKeys = Object.keys(records[0]);
      const numericCols = allKeys.filter((k) => {
        if (k === 'CustomerID' || k === 'Cluster') return false;
        return typeof records[0][k] === 'number';
      });

      if (numericCols.length < 2) {
        return res.status(422).json({
          error: 'Dataset must contain at least 2 numerical features for clustering.',
        });
      }

      const chosen = DEFAULT_FEATURES.filter((f) => numericCols.includes(f));
      const featuresToUse = chosen.length >= 2 ? chosen : numericCols.slice(0, 5);

      currentDataset = records;
      runClusteringPipeline(5, featuresToUse);

      const missingCounts: Record<string, number> = {};
      allKeys.forEach((k) => {
        missingCounts[k] = records.filter(
          (r) => r[k] === undefined || r[k] === null || r[k] === ''
        ).length;
      });

      res.json({
        success: true,
        message: `Successfully loaded ${records.length} records.`,
        data: {
          total_rows: records.length,
          columns: allKeys,
          numeric_columns: numericCols,
          selected_features: featuresToUse,
          missing_values: missingCounts,
          sample_rows: records.slice(0, 10),
        },
        summary: getSummaryPayload(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/elbow', (req, res) => {
    try {
      const features = req.body?.features || currentFeatures;
      const result = computeElbowCurve(features);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/cluster', (req, res) => {
    try {
      const k = parseInt(req.body?.k) || 5;
      const features = req.body?.features || currentFeatures;

      if (k < 2) {
        return res.status(422).json({ error: 'K must be at least 2.' });
      }
      if (k > currentDataset.length) {
        return res.status(422).json({
          error: 'K cannot exceed the number of customer records.',
        });
      }

      runClusteringPipeline(k, features);

      res.json({
        success: true,
        message: `K-Means clustered customers into ${k} segments.`,
        summary: getSummaryPayload(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/predict', (req, res) => {
    try {
      const input = req.body || {};
      const x_scaled = currentScaler.transform(input);

      // Calculate Euclidean distance to each centroid in scaled space
      const distances = currentModel.centroids.map((cent, c_idx) => {
        let distSq = 0;
        for (let dim = 0; dim < x_scaled.length; dim++) {
          distSq += Math.pow(x_scaled[dim] - cent[dim], 2);
        }
        const dist = Math.sqrt(distSq);
        const profile = currentProfiles.find((p) => p.cluster_id === c_idx);
        return {
          cluster_id: c_idx,
          segment_name: profile?.segment_name || `Cluster ${c_idx}`,
          tag: profile?.tag || '',
          color: profile?.color || '#6366F1',
          distance: Math.round(dist * 10000) / 10000,
        };
      });

      const bestMatch = [...distances].sort((a, b) => a.distance - b.distance)[0];
      const bestProfile = currentProfiles.find((p) => p.cluster_id === bestMatch.cluster_id);

      res.json({
        success: true,
        customer_input: input,
        prediction: {
          predicted_cluster: bestMatch.cluster_id,
          segment_name: bestProfile?.segment_name || `Cluster ${bestMatch.cluster_id}`,
          tag: bestProfile?.tag || '',
          color: bestProfile?.color || '#6366F1',
          description: bestProfile?.description || '',
          recommendations: bestProfile?.recommendations || [],
          centroid_values: bestProfile?.centroids || {},
          distances_to_all_centroids: distances,
          explanation: `Customer standardized with training StandardScaler (z-scores). Nearest centroid is Cluster ${bestMatch.cluster_id} ('${bestMatch.segment_name}') with Euclidean distance = ${bestMatch.distance}.`,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/cluster-summary', (req, res) => {
    res.json(getSummaryPayload());
  });

  app.get('/api/customers', (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string)?.toLowerCase();
      const clusterParam = req.query.cluster ? parseInt(req.query.cluster as string) : null;
      const sortBy = (req.query.sort_by as string) || 'CustomerID';
      const sortOrder = (req.query.sort_order as string)?.toLowerCase() || 'asc';

      let filtered = [...currentClusteredData];

      if (clusterParam !== null && !isNaN(clusterParam) && clusterParam >= 0) {
        filtered = filtered.filter((d) => d.Cluster === clusterParam);
      }

      if (search) {
        filtered = filtered.filter((d) => {
          const id = String(d.CustomerID || '').toLowerCase();
          const seg = String(d.Segment || '').toLowerCase();
          const gen = String(d.Gender || '').toLowerCase();
          return id.includes(search) || seg.includes(search) || gen.includes(search);
        });
      }

      filtered.sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      });

      const totalRecords = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      res.json({
        page,
        limit,
        total_records: totalRecords,
        total_pages: totalPages,
        data,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/download', (req, res) => {
    try {
      if (currentClusteredData.length === 0) {
        return res.status(400).send('No clustered data available.');
      }
      const keys = Object.keys(currentClusteredData[0]);
      const headerLine = keys.join(',');
      const rows = currentClusteredData.map((d: any) => keys.map((k) => d[k]).join(','));
      const csv = [headerLine, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=clustered_customers.csv');
      res.send(csv);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // FRONTEND INTEGRATION: Vite middlewares in dev, static dist in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Customer Segmentation ML App listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
