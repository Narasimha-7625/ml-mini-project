import React from 'react';
import { SegmentProfile } from '../types';
import { ArrowRight, Tag } from 'lucide-react';

interface ClusterSummaryTableProps {
  profiles: SegmentProfile[];
  onSelectCluster?: (clusterId: number) => void;
}

export const ClusterSummaryTable: React.FC<ClusterSummaryTableProps> = ({
  profiles,
  onSelectCluster,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Discovered Customer Segment Summary
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical centroid characteristics in natural business units
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          {profiles.length} Segments
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
              <th className="py-3 px-3">Cluster ID & Segment</th>
              <th className="py-3 px-3 text-center">Tag / Persona</th>
              <th className="py-3 px-3 text-right">Customers (%)</th>
              <th className="py-3 px-3 text-right">Avg Income</th>
              <th className="py-3 px-3 text-right">Avg Spending</th>
              <th className="py-3 px-3 text-right">Avg Purchases</th>
              <th className="py-3 px-3 text-right">Avg Order Val</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {profiles.map((p) => (
              <tr
                key={p.cluster_id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                <td className="py-3.5 px-3">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <div>
                      <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        Cluster {p.cluster_id}: {p.segment_name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {p.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-center">
                  <span
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                    style={{
                      borderColor: `${p.color}40`,
                      backgroundColor: `${p.color}15`,
                      color: p.color,
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{p.tag}</span>
                  </span>
                </td>

                <td className="py-3.5 px-3 text-right font-medium">
                  <span className="text-white font-bold">{p.customer_count}</span>
                  <span className="text-slate-400 text-[11px] ml-1">({p.percentage}%)</span>
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-400">
                  ${Math.round(p.centroids['AnnualIncome'] || 0).toLocaleString()}
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-semibold text-amber-400">
                  {Math.round(p.centroids['SpendingScore'] || 0)} / 100
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                  {Math.round(p.centroids['PurchaseFrequency'] || 0)} / yr
                </td>

                <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                  ${Math.round(p.centroids['AverageOrderValue'] || 0)}
                </td>

                <td className="py-3.5 px-3 text-center">
                  {onSelectCluster && (
                    <button
                      onClick={() => onSelectCluster(p.cluster_id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
