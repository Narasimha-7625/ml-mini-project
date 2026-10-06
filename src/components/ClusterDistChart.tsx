import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { SegmentProfile } from '../types';

interface ClusterDistChartProps {
  profiles: SegmentProfile[];
  totalCustomers: number;
}

export const ClusterDistChart: React.FC<ClusterDistChartProps> = ({
  profiles,
  totalCustomers,
}) => {
  const chartData = profiles.map((p) => ({
    name: `C${p.cluster_id}: ${p.tag || p.segment_name}`,
    shortName: `C${p.cluster_id}`,
    segment: p.segment_name,
    count: p.customer_count,
    percentage: p.percentage,
    color: p.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-lg text-xs space-y-1">
          <div className="font-bold text-white">{d.segment}</div>
          <div className="text-slate-300">
            Customers: <span className="font-semibold text-emerald-400">{d.count}</span> ({d.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-100">Customer Distribution by Cluster</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Proportion of customer base allocated to each discovered behavioral segment
        </p>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {profiles.map((p) => (
          <div key={p.cluster_id} className="flex items-center justify-between bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-slate-200 truncate font-medium text-[11px]">
                C{p.cluster_id}: {p.segment_name}
              </span>
            </div>
            <span className="font-mono text-slate-400 text-[11px] shrink-0 ml-2">
              {p.customer_count} ({p.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
