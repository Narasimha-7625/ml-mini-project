import React, { useState } from 'react';
import { DashboardSummary, SegmentProfile } from '../types';
import {
  PieChart,
  Tag,
  DollarSign,
  Activity,
  ShoppingBag,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ClusterAnalysisPageProps {
  summary: DashboardSummary | null;
  selectedClusterId?: number | null;
}

export const ClusterAnalysisPage: React.FC<ClusterAnalysisPageProps> = ({
  summary,
  selectedClusterId,
}) => {
  const [activeCluster, setActiveCluster] = useState<number>(selectedClusterId ?? 0);

  if (!summary || !summary.profiles.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
        No cluster profiles available. Please run clustering first.
      </div>
    );
  }

  const currentProfile =
    summary.profiles.find((p) => p.cluster_id === activeCluster) || summary.profiles[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Cluster Persona Interpretation & Marketing Strategies
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic qualitative customer personas automatically derived from multi-attribute centroid statistics
        </p>
      </div>

      {/* Cluster Navigation Pill Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {summary.profiles.map((p) => {
          const isSelected = p.cluster_id === currentProfile.cluster_id;
          return (
            <button
              key={p.cluster_id}
              onClick={() => setActiveCluster(p.cluster_id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: isSelected ? p.color : undefined,
                borderColor: isSelected ? p.color : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? '#ffffff' : p.color }}
              />
              <span>
                C{p.cluster_id}: {p.tag}
              </span>
              <span className="text-[10px] opacity-80 font-mono">({p.percentage}%)</span>
            </button>
          );
        })}
      </div>

      {/* Detailed Persona Overview Card */}
      <div
        className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-sm transition-all"
        style={{
          backgroundColor: `${currentProfile.color}10`,
          borderColor: `${currentProfile.color}40`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: currentProfile.color }}
              />
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Cluster {currentProfile.cluster_id} Persona Profile
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentProfile.segment_name}
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className="px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-1.5"
              style={{
                borderColor: currentProfile.color,
                color: currentProfile.color,
                backgroundColor: `${currentProfile.color}20`,
              }}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{currentProfile.tag}</span>
            </span>

            <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white font-mono text-xs font-semibold border border-slate-700">
              {currentProfile.customer_count} Customers ({currentProfile.percentage}%)
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
          {currentProfile.description}
        </p>

        {/* Centroid Averages Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Centroid Vector Benchmark (Cluster Averages)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>Annual Income</span>
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                ${Math.round(currentProfile.centroids['AnnualIncome'] || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Spending Score</span>
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {Math.round(currentProfile.centroids['SpendingScore'] || 0)} / 100
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <ShoppingBag className="w-3 h-3 text-indigo-400" />
                <span>Purchase Frequency</span>
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {Math.round(currentProfile.centroids['PurchaseFrequency'] || 0)} / yr
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span>Average Order Value</span>
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                ${Math.round(currentProfile.centroids['AverageOrderValue'] || 0)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Layers className="w-3 h-3 text-purple-400" />
                <span>Website Visits</span>
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {Math.round(currentProfile.centroids['WebsiteVisits'] || 0)} / mo
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Marketing Strategies */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Tailored Marketing Playbook & Strategic Actions</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentProfile.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-200"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: currentProfile.color }}
                >
                  {idx + 1}
                </div>
                <div className="leading-relaxed font-medium">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Cluster Comparative Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Cross-Cluster Comparative Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.profiles.map((p) => (
            <div
              key={p.cluster_id}
              onClick={() => setActiveCluster(p.cluster_id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                p.cluster_id === currentProfile.cluster_id
                  ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-bold text-white text-xs">Cluster {p.cluster_id}</span>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: `${p.color}50`,
                    color: p.color,
                    backgroundColor: `${p.color}15`,
                  }}
                >
                  {p.tag}
                </span>
              </div>

              <div className="font-semibold text-slate-200 text-sm line-clamp-1">
                {p.segment_name}
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2">{p.description}</div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Income:</span>
                  <span className="text-emerald-400 font-semibold">
                    ${Math.round(p.centroids['AnnualIncome'] || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Spending:</span>
                  <span className="text-amber-400 font-semibold">
                    {Math.round(p.centroids['SpendingScore'] || 0)}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
