import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Crosshair,
  TrendingUp,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { CustomerInputData, PredictionResult } from '../types';
import { predictCustomer } from '../services/api';

const SAMPLE_PRESETS: { label: string; desc: string; data: CustomerInputData }[] = [
  {
    label: 'Affluent VIP Profile',
    desc: 'High income, high spending, high order value',
    data: {
      Age: 44,
      AnnualIncome: 115000,
      SpendingScore: 88,
      PurchaseFrequency: 32,
      AverageOrderValue: 310,
      WebsiteVisits: 35,
      CustomerLoyaltyYears: 6,
    },
  },
  {
    label: 'Cautious High-Earner',
    desc: 'High income, low spending, high caution',
    data: {
      Age: 52,
      AnnualIncome: 110000,
      SpendingScore: 22,
      PurchaseFrequency: 7,
      AverageOrderValue: 190,
      WebsiteVisits: 9,
      CustomerLoyaltyYears: 5,
    },
  },
  {
    label: 'Young Trendsetter',
    desc: 'Modest income, high spending, high frequency',
    data: {
      Age: 24,
      AnnualIncome: 32000,
      SpendingScore: 86,
      PurchaseFrequency: 28,
      AverageOrderValue: 65,
      WebsiteVisits: 45,
      CustomerLoyaltyYears: 2,
    },
  },
  {
    label: 'Budget Occasional Shopper',
    desc: 'Low income, low spending, infrequent visits',
    data: {
      Age: 38,
      AnnualIncome: 24000,
      SpendingScore: 18,
      PurchaseFrequency: 4,
      AverageOrderValue: 40,
      WebsiteVisits: 8,
      CustomerLoyaltyYears: 1,
    },
  },
];

export const PredictionPage: React.FC = () => {
  const [formData, setFormData] = useState<CustomerInputData>({
    Age: 35,
    AnnualIncome: 75000,
    SpendingScore: 60,
    PurchaseFrequency: 15,
    AverageOrderValue: 140,
    WebsiteVisits: 18,
    CustomerLoyaltyYears: 3,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictCustomer(formData);
      setResult(res.prediction);
    } catch (err: any) {
      setError(err.message || 'Failed to score customer profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setFormData(preset.data);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Predict Customer Segment
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Enter customer purchasing and demographic attributes to score the nearest K-Means cluster centroid
        </p>
      </div>

      {/* Preset Profiles Picker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Quick Persona Pre-Sets (Viva Test Cases)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800 transition-all cursor-pointer group"
            >
              <div className="font-semibold text-white text-xs group-hover:text-indigo-300 transition-colors">
                {preset.label}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Customer Feature Attributes</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              StandardScaler Active
            </span>
          </div>

          <form onSubmit={handlePredict} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Age: <span className="font-mono text-indigo-400">{formData.Age} years</span>
              </label>
              <input
                type="number"
                min={18}
                max={95}
                value={formData.Age}
                onChange={(e) => setFormData({ ...formData, Age: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Annual Income ($):{' '}
                <span className="font-mono text-emerald-400">
                  ${formData.AnnualIncome.toLocaleString()}
                </span>
              </label>
              <input
                type="number"
                step={500}
                min={10000}
                max={250000}
                value={formData.AnnualIncome}
                onChange={(e) =>
                  setFormData({ ...formData, AnnualIncome: Number(e.target.value) })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Spending Score (1-100):{' '}
                <span className="font-mono text-amber-400">{formData.SpendingScore} / 100</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={formData.SpendingScore}
                onChange={(e) =>
                  setFormData({ ...formData, SpendingScore: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Purchases / Year:
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.PurchaseFrequency}
                  onChange={(e) =>
                    setFormData({ ...formData, PurchaseFrequency: Number(e.target.value) })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Avg Order Value ($):
                </label>
                <input
                  type="number"
                  min={5}
                  max={2000}
                  value={formData.AverageOrderValue}
                  onChange={(e) =>
                    setFormData({ ...formData, AverageOrderValue: Number(e.target.value) })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Website Visits / Mo:
                </label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={formData.WebsiteVisits}
                  onChange={(e) =>
                    setFormData({ ...formData, WebsiteVisits: Number(e.target.value) })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Loyalty Tenure (Yrs):
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={formData.CustomerLoyaltyYears}
                  onChange={(e) =>
                    setFormData({ ...formData, CustomerLoyaltyYears: Number(e.target.value) })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Computing Nearest Centroid...' : 'Predict Customer Segment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Prediction Results & Mathematical Distance Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Main Classification Card */}
              <div
                className="p-6 rounded-2xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: `${result.color}10`,
                  borderColor: `${result.color}40`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: result.color }}
                    />
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                      Assigned Segment: Cluster {result.predicted_cluster}
                    </span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      borderColor: result.color,
                      color: result.color,
                      backgroundColor: `${result.color}20`,
                    }}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {result.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {result.segment_name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {result.description}
                  </p>
                </div>

                {/* Mathematical explanation */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">{result.explanation}</p>
                </div>
              </div>

              {/* Step 3: Euclidean Distances to All Centroids */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crosshair className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Euclidean Distance to All Centroids (Scaled Space)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    d = √Σ(x_i - c_i)²
                  </span>
                </div>

                <div className="space-y-2">
                  {result.distances_to_all_centroids.map((item) => {
                    const isWinner = item.cluster_id === result.predicted_cluster;
                    return (
                      <div
                        key={item.cluster_id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isWinner
                            ? 'bg-indigo-950/40 border-indigo-500 font-bold text-white ring-1 ring-indigo-500/40'
                            : 'bg-slate-850/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className={isWinner ? 'text-white' : 'text-slate-300'}>
                            Cluster {item.cluster_id}: {item.segment_name} ({item.tag})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono">
                          <span className={isWinner ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            d = {item.distance}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase font-sans">
                              Nearest (Argmin)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Marketing Strategy */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Recommended Business & Marketing Strategies
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start space-x-2 text-slate-300 leading-snug"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Blank state prompting prediction */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-white">Ready to Classify Customer</h3>
                <p className="text-xs text-slate-400">
                  Select a preset persona from above or customize the input form on the left, then click
                  &quot;Predict Customer Segment&quot; to calculate the Euclidean distance to each cluster centroid.
                </p>
              </div>
              <button
                onClick={() => handlePredict()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                Run Prediction with Current Values
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
