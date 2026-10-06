import React from 'react';
import { DashboardSummary } from '../types';
import { NavTab } from '../components/Navbar';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { MetricsCards } from '../components/MetricsCards';
import { ScatterPlot } from '../components/ScatterPlot';
import { ClusterDistChart } from '../components/ClusterDistChart';
import { ClusterMetricsCharts } from '../components/ClusterMetricsCharts';
import { ClusterSummaryTable } from '../components/ClusterSummaryTable';
import { RefreshCw, UserCheck, GitBranch, Download } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigate: (tab: NavTab) => void;
  onSelectCluster: (clusterId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  loading,
  onRefresh,
  onNavigate,
  onSelectCluster,
}) => {
  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading K-Means cluster analysis...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <p className="text-slate-300">No customer data loaded yet.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500"
        >
          Load Sample Dataset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Stepper */}
      <WorkflowStepper currentStep={5} onSelectTab={onNavigate} />

      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Customer Segmentation Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time clustering results using StandardScaler & K-Means (K = {summary.k})
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Reload dataset and reset baseline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Sample</span>
          </button>

          <button
            onClick={() => onNavigate('clustering')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Tune K & Features</span>
          </button>

          <button
            onClick={() => onNavigate('prediction')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Predict Customer</span>
          </button>

          <a
            href={getDownloadUrl()}
            download="clustered_customers.csv"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <MetricsCards summary={summary} />

      {/* Primary Visualizations: Scatter Plot & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScatterPlot
            points={summary.scatter_points}
            centroids={summary.centroids}
            profiles={summary.profiles}
            featureCount={summary.selected_features.length}
          />
        </div>
        <div className="lg:col-span-1">
          <ClusterDistChart
            profiles={summary.profiles}
            totalCustomers={summary.total_customers}
          />
        </div>
      </div>

      {/* Secondary Metrics: Purchase Frequency & AOV */}
      <ClusterMetricsCharts profiles={summary.profiles} />

      {/* Cluster Summary Table */}
      <ClusterSummaryTable
        profiles={summary.profiles}
        onSelectCluster={(cid) => {
          onSelectCluster(cid);
          onNavigate('analysis');
        }}
      />
    </div>
  );
};
