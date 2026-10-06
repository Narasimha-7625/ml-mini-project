import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ScatterPoint, CentroidPoint, SegmentProfile } from '../types';
import { Info, Crosshair } from 'lucide-react';

interface ScatterPlotProps {
  points: ScatterPoint[];
  centroids: CentroidPoint[];
  profiles: SegmentProfile[];
  featureCount: number;
}

const CLUSTER_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  points,
  centroids,
  profiles,
  featureCount,
}) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<number | null>(null);

  const filteredPoints =
    selectedClusterFilter === null
      ? points
      : points.filter((p) => p.cluster === selectedClusterFilter);

  const getClusterColor = (c: number) => {
    const profile = profiles.find((p) => p.cluster_id === c);
    return profile?.color || CLUSTER_COLORS[c % CLUSTER_COLORS.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCentroid = data.isCentroid;

      if (isCentroid) {
        return (
          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 text-slate-200">
            <div className="flex items-center space-x-1.5 font-bold text-amber-400">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Centroid (Center) of Cluster {data.cluster}</span>
            </div>
            <div className="font-semibold text-white">{data.segment}</div>
            <div className="text-slate-400">
              Income Mean: <span className="text-white font-medium">${Math.round(data.x).toLocaleString()}</span>
            </div>
            <div className="text-slate-400">
              Spending Mean: <span className="text-white font-medium">{Math.round(data.y)}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 text-slate-200">
          <div className="font-bold text-indigo-400">{data.CustomerID}</div>
          <div className="font-semibold text-white">{data.segment}</div>
          <div className="text-slate-400">
            Annual Income: <span className="text-white font-medium">${data.x.toLocaleString()}</span>
          </div>
          <div className="text-slate-400">
            Spending Score: <span className="text-white font-medium">{data.y} / 100</span>
          </div>
          {data.freq !== undefined && (
            <div className="text-slate-400">
              Purchases/Yr: <span className="text-white font-medium">{data.freq}</span>
            </div>
          )}
          {data.aov !== undefined && (
            <div className="text-slate-400">
              Avg Order Value: <span className="text-white font-medium">${data.aov}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Convert centroids to scatter format
  const centroidScatterData = centroids.map((c) => ({
    CustomerID: `Centroid ${c.cluster}`,
    x: c.x,
    y: c.y,
    cluster: c.cluster,
    segment: c.segment,
    isCentroid: true,
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-100">
              Income vs. Spending Score Cluster Scatter
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              2D Projection
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            X-Axis: Annual Income ($) • Y-Axis: Spending Score (1-100) • Crosshairs represent cluster centroids
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <button
            onClick={() => setSelectedClusterFilter(null)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              selectedClusterFilter === null
                ? 'bg-slate-100 text-slate-900 font-bold border-white'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            All ({points.length})
          </button>
          {profiles.map((p) => {
            const isSelected = selectedClusterFilter === p.cluster_id;
            return (
              <button
                key={p.cluster_id}
                onClick={() =>
                  setSelectedClusterFilter(isSelected ? null : p.cluster_id)
                }
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'ring-2 ring-indigo-400 font-bold text-white'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                style={{
                  backgroundColor: isSelected ? p.color : undefined,
                  borderColor: p.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span>C{p.cluster_id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scatter Chart */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              type="number"
              dataKey="x"
              name="Annual Income"
              unit="$"
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Spending Score"
              stroke="#94a3b8"
              fontSize={11}
              domain={[0, 105]}
            />
            <ZAxis range={[35, 35]} />
            <Tooltip content={<CustomTooltip />} />

            {/* Customer Points */}
            <Scatter name="Customers" data={filteredPoints}>
              {filteredPoints.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getClusterColor(entry.cluster)}
                  fillOpacity={0.75}
                  stroke="#0f172a"
                  strokeWidth={0.5}
                />
              ))}
            </Scatter>

            {/* Centroids */}
            <Scatter
              name="Centroids"
              data={centroidScatterData}
              shape="cross"
            >
              {centroidScatterData.map((entry, index) => (
                <Cell
                  key={`cent-${index}`}
                  fill="#ffffff"
                  stroke={getClusterColor(entry.cluster)}
                  strokeWidth={3}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Dimensionality note */}
      <div className="mt-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Dimensionality Note:</strong> K-Means was executed across{' '}
          <span className="font-semibold text-indigo-300">{featureCount} standardized dimensions</span>.
          This 2D scatter plot projects the two most intuitively interpretable dimensions (
          <em>Annual Income vs Spending Score</em>). Points may overlap slightly in this 2D view because
          they are separated in other feature dimensions (such as Purchase Frequency, Average Order Value, or Website Visits).
        </p>
      </div>
    </div>
  );
};
