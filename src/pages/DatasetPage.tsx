import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { CustomerRecord, DashboardSummary } from '../types';
import {
  fetchCustomers,
  uploadCsvFile,
  loadSampleData,
  getDownloadUrl,
} from '../services/api';

interface DatasetPageProps {
  summary: DashboardSummary | null;
  onDatasetUpdated: (summary: DashboardSummary) => void;
}

export const DatasetPage: React.FC<DatasetPageProps> = ({
  summary,
  onDatasetUpdated,
}) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [clusterFilter, setClusterFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('CustomerID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const res = await fetchCustomers({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        cluster: clusterFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setCustomers(res.data);
      setTotalRecords(res.total_records);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
  }, [page, pageSize, clusterFilter, sortBy, sortOrder]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadTableData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file format. Please upload a standard CSV (.csv) file.');
      setIsUploading(false);
      return;
    }

    try {
      const text = await file.text();
      const res = await uploadCsvFile(text);
      setUploadSuccess(res.message);
      onDatasetUpdated(res.summary);
      setPage(1);
      setTimeout(() => loadTableData(), 200);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process CSV file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleResetSample = async () => {
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);
    try {
      const res = await loadSampleData();
      setUploadSuccess('Sample dataset loaded successfully (500 synthetic records).');
      onDatasetUpdated(res.summary);
      setPage(1);
      setTimeout(() => loadTableData(), 200);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Customer Dataset Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Load sample records or upload your custom CSV file for K-Means segmentation
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleResetSample}
            disabled={isUploading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Sample Dataset</span>
          </button>

          <a
            href={getDownloadUrl()}
            download="clustered_customers.csv"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Clustered CSV</span>
          </a>
        </div>
      </div>

      {/* Upload & Ingestion Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Custom Customer CSV</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Max 10MB</span>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-400 bg-indigo-950/30'
                : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag & Drop your customer CSV here, or <span className="text-indigo-400">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Supported columns: CustomerID, Age, Gender, AnnualIncome, SpendingScore, PurchaseFrequency,
              AverageOrderValue, WebsiteVisits, CustomerLoyaltyYears.
            </p>
          </div>

          {/* Feedback Alerts */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Upload Error:</strong> {uploadError}
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{uploadSuccess}</div>
            </div>
          )}
        </div>

        {/* Dataset Schema & Imputation Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Dataset Health & Schema</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Total Records</span>
              <span className="font-mono text-white font-bold">{summary?.total_customers || 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Active Clustering Features</span>
              <span className="font-mono text-indigo-400 font-bold">
                {summary?.selected_features.length || 0}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Missing Values Handling</span>
              <span className="text-emerald-400 font-medium">Mean Imputation</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Scaling Technique</span>
              <span className="text-slate-200 font-medium">StandardScaler (z = (x-μ)/σ)</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Clustered Numerical Features
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary?.selected_features.map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Customer Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Customer Records Explorer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse raw customer behavioral metrics mapped to assigned K-Means clusters
            </p>
          </div>

          {/* Search & Cluster Filter Controls */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, Segment, Gender..."
                className="pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
              />
            </div>

            {/* Cluster Dropdown Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={clusterFilter === null ? '' : clusterFilter}
                onChange={(e) =>
                  setClusterFilter(e.target.value === '' ? null : parseInt(e.target.value))
                }
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Clusters</option>
                {summary?.profiles.map((p) => (
                  <option key={p.cluster_id} value={p.cluster_id}>
                    Cluster {p.cluster_id} ({p.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('CustomerID')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-center"
                  onClick={() => handleSort('Age')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Gender</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort('AnnualIncome')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Income</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort('SpendingScore')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Spending</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort('PurchaseFrequency')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Orders/Yr</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort('AverageOrderValue')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>AOV</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort('WebsiteVisits')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Visits</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort('CustomerLoyaltyYears')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Loyalty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Assigned Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const profile = summary?.profiles.find((p) => p.cluster_id === c.Cluster);
                  return (
                    <tr key={c.CustomerID} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-200">
                        {c.CustomerID}
                      </td>
                      <td className="py-3 px-3 text-center">{c.Age}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            c.Gender === 'Female'
                              ? 'bg-pink-500/10 text-pink-300'
                              : 'bg-blue-500/10 text-blue-300'
                          }`}
                        >
                          {c.Gender}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                        ${Number(c.AnnualIncome).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-amber-400">
                        {c.SpendingScore}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{c.PurchaseFrequency}</td>
                      <td className="py-3 px-3 text-right font-mono">${c.AverageOrderValue}</td>
                      <td className="py-3 px-3 text-right font-mono">{c.WebsiteVisits}</td>
                      <td className="py-3 px-3 text-right font-mono">{c.CustomerLoyaltyYears}y</td>
                      <td className="py-3 px-3 text-center">
                        {c.Cluster !== undefined && (
                          <span
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                            style={{
                              borderColor: `${profile?.color || '#6366f1'}40`,
                              backgroundColor: `${profile?.color || '#6366f1'}15`,
                              color: profile?.color || '#818cf8',
                            }}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>
                              C{c.Cluster}: {profile?.tag || c.Segment}
                            </span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, totalRecords)} of {totalRecords} records
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
