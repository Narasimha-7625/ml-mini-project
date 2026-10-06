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

interface ClusterMetricsChartsProps {
  profiles: SegmentProfile[];
}

export const ClusterMetricsCharts: React.FC<ClusterMetricsChartsProps> = ({ profiles }) => {
  const freqData = profiles.map((p) => ({
    name: `C${p.cluster_id}`,
    segment: p.segment_name,
    freq: p.centroids['PurchaseFrequency'] || 0,
    color: p.color,
  }));

  const aovData = profiles.map((p) => ({
    name: `C${p.cluster_id}`,
    segment: p.segment_name,
    aov: p.centroids['AverageOrderValue'] || 0,
    color: p.color,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Purchase Frequency Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-100">
            Average Purchase Frequency (Orders / Year)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mean annual transactions per customer in each cluster
          </p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={freqData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs">
                        <div className="font-bold text-white">{d.segment}</div>
                        <div className="text-indigo-400 font-semibold">{d.freq} orders / yr</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="freq" radius={[4, 4, 0, 0]}>
                {freqData.map((e, i) => (
                  <Cell key={`pf-${i}`} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Order Value Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-100">
            Average Order Value (AOV in $)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mean monetary basket size per transaction
          </p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aovData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs">
                        <div className="font-bold text-white">{d.segment}</div>
                        <div className="text-emerald-400 font-semibold">${d.aov} / order</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="aov" radius={[4, 4, 0, 0]}>
                {aovData.map((e, i) => (
                  <Cell key={`aov-${i}`} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
