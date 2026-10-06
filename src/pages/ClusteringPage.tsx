import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Dot,
} from 'recharts';
import {
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
  Sliders,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { DashboardSummary, ElbowPoint } from '../types';
import { getElbowCurve, runClustering } from '../services/api';

interface ClusteringPageProps {
  summary: DashboardSummary | null;
  onClusteringComplete: (summary: DashboardSummary) => void;
}

const ALL_NUMERIC_FEATURES = [
  'AnnualIncome',
  'SpendingScore',
  'PurchaseFrequency',
  'AverageOrderValue',
  'WebsiteVisits',
  'Age',
  'CustomerLoyaltyYears',
];

export const ClusteringPage: React.FC<ClusteringPageProps> = ({
  summary,
  onClusteringComplete,
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    summary?.selected_features || [
      'AnnualIncome',
      'SpendingScore',
      'PurchaseFrequency',
      'AverageOrderValue',
      'WebsiteVisits',
    ]
  );
  const [elbowData, setElbowData] = useState<ElbowPoint[]>([]);
  const [recommendedK, setRecommendedK] = useState<number>(summary?.k || 5);
  const [manualK, setManualK] = useState<number>(summary?.k || 5);
  const [isComputingElbow, setIsComputingElbow] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainSuccess, setTrainSuccess] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);

  // Fetch elbow curve on mount
  const loadElbow = async () => {
    setIsComputingElbow(true);
    try {
      const res = await getElbowCurve(selectedFeatures);
      setElbowData(res.elbow_curve);
      setRecommendedK(res.recommended_k);
    } catch (err: any) {
      console.error('Elbow calculation error:', err);
    } finally {
      setIsComputingElbow(false);
    }
  };

  useEffect(() => {
    loadElbow();
  }, []);

  const handleToggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length <= 2) {
        setTrainError('At least 2 numerical features are required for clustering.');
        return;
      }
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
    setTrainError(null);
  };

  const handleRunClustering = async (kToUse: number) => {
    setIsTraining(true);
    setTrainSuccess(null);
    setTrainError(null);
    try {
      const res = await runClustering(kToUse, selectedFeatures);
      setTrainSuccess(`K-Means successfully trained with K = ${kToUse} and random_state = 42!`);
      onClusteringComplete(res.summary);
    } catch (err: any) {
      setTrainError(err.message || 'Failed to train clustering model.');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            K-Means Clustering & Elbow Method Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimize hyperparameter K using inertia decay and choose custom feature vectors
          </p>
        </div>

        <button
          onClick={loadElbow}
          disabled={isComputingElbow}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isComputingElbow ? 'animate-spin' : ''}`} />
          <span>Recalculate Elbow Curve</span>
        </button>
      </div>

      {/* Feature Selection Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Select Clustering Features</h3>
          </div>
          <span className="text-xs text-indigo-400 font-mono">
            {selectedFeatures.length} of {ALL_NUMERIC_FEATURES.length} Selected
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Features are standardized via <strong>StandardScaler (z-score)</strong> so high-scale metrics
          (like $100,000 Annual Income) do not mathematically overpower small-scale metrics (like 12 Purchases/Year).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {ALL_NUMERIC_FEATURES.map((feat) => {
            const isChecked = selectedFeatures.includes(feat);
            return (
              <button
                key={feat}
                onClick={() => handleToggleFeature(feat)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                  isChecked
                    ? 'bg-indigo-950/60 border-indigo-500/80 text-white ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 text-[11px] truncate">
                    {feat}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-600'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  {feat === 'AnnualIncome'
                    ? 'Income ($)'
                    : feat === 'SpendingScore'
                    ? 'Index (1-100)'
                    : feat === 'PurchaseFrequency'
                    ? 'Orders/Yr'
                    : feat === 'AverageOrderValue'
                    ? 'AOV ($)'
                    : feat === 'WebsiteVisits'
                    ? 'Visits/Mo'
                    : feat}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Elbow Method Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elbow Curve Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">The Elbow Method Curve</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                X-Axis: Number of Clusters (K) • Y-Axis: Inertia (Within-Cluster Sum of Squares)
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              Heuristic Recommended: K = {recommendedK}
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isComputingElbow ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Calculating inertia across K=2 through K=10...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={elbowData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="k"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(v) => `K = ${v}`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => v.toLocaleString()}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                            <div className="font-bold text-white">Clusters: K = {pt.k}</div>
                            <div className="text-indigo-400 font-mono">
                              Inertia: {pt.inertia.toLocaleString()}
                            </div>
                            {pt.k === recommendedK && (
                              <div className="text-emerald-400 font-semibold text-[10px]">
                                ★ Point of diminishing returns (Elbow)
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inertia"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={(props: any) => {
                      const isRec = props.payload.k === recommendedK;
                      return (
                        <circle
                          key={props.payload.k}
                          cx={props.cx}
                          cy={props.cy}
                          r={isRec ? 7 : 4}
                          fill={isRec ? '#10B981' : '#6366F1'}
                          stroke="#ffffff"
                          strokeWidth={isRec ? 2 : 1}
                        />
                      );
                    }}
                    activeDot={{ r: 8, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Core Principle: Practical Heuristic, Not Mathematical Perfection</span>
            </div>
            <p className="leading-relaxed">
              &quot;The Elbow Method helps identify a suitable number of clusters by observing where the reduction in inertia begins to slow down.&quot;
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              It evaluates the tradeoff between cluster compactness (low inertia) and model parsimony (fewer clusters).
              It is a practical heuristic guide, not an infallible mathematical law. Domain expertise and marketing
              usability must always guide the final decision.
            </p>
          </div>
        </div>

        {/* Hyperparameter K Selection & Training Control */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">K-Means Configuration</h3>
            </div>

            {/* Recommended K action */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold">Recommended K:</span>
                <span className="font-mono font-bold text-white text-base">K = {recommendedK}</span>
              </div>
              <button
                onClick={() => {
                  setManualK(recommendedK);
                  handleRunClustering(recommendedK);
                }}
                disabled={isTraining}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Recommended K ({recommendedK})</span>
              </button>
            </div>

            {/* Manual K Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Manual K Selection:</span>
                <span className="font-mono text-indigo-400 font-bold text-sm">K = {manualK}</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={manualK}
                onChange={(e) => setManualK(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>K=2 (Broad)</span>
                <span>K=5 (Balanced)</span>
                <span>K=10 (Granular)</span>
              </div>
            </div>

            {/* Scikit-Learn Hyperparameters info */}
            <div className="pt-2 text-xs text-slate-400 space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-300">scikit-learn Parameters:</div>
              <div className="font-mono text-[11px] text-slate-400 space-y-0.5">
                <div>• n_clusters = {manualK}</div>
                <div>• random_state = 42 (Reproducible)</div>
                <div>• n_init = 10 (Best of 10 runs)</div>
                <div>• init = &quot;k-means++&quot; (Smart seeding)</div>
              </div>
            </div>
          </div>

          {/* Run Button and Alerts */}
          <div className="space-y-2">
            {trainError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {trainError}
              </div>
            )}
            {trainSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{trainSuccess}</span>
              </div>
            )}
            <button
              onClick={() => handleRunClustering(manualK)}
              disabled={isTraining}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Play className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Standardizing & Training...' : `Run K-Means (K = ${manualK})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Educational Walkthrough: The 6-Step K-Means Cycle */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            The 6-Step K-Means Algorithmic Cycle
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {[
            {
              step: '1. Choose K',
              desc: 'Select desired number of clusters (e.g. K=5) guided by the Elbow Method and business strategy.',
            },
            {
              step: '2. Initialize Centroids',
              desc: 'Seed K points in scaled space using k-means++ to maximize initial spread and prevent poor local minima.',
            },
            {
              step: '3. Calculate Distances',
              desc: 'Compute Euclidean distance d(x, c) = sqrt(sum((x_i - c_i)^2)) from every customer point to each centroid.',
            },
            {
              step: '4. Assign to Nearest',
              desc: 'Assign each customer to the cluster corresponding to the nearest centroid: c* = argmin d(x, c_k).',
            },
            {
              step: '5. Recalculate Centroids',
              desc: 'Compute the arithmetic mean of all customer vectors assigned to each cluster: c_new = (1/N) * sum(x_i).',
            },
            {
              step: '6. Check Convergence',
              desc: 'Repeat steps 3-5 until centroids cease to shift or shift less than the tolerance threshold (1e-4).',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
              <span className="font-bold text-indigo-400">{item.step}</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
