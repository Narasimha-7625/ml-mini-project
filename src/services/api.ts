import {
  DashboardSummary,
  ElbowResponse,
  PredictionResult,
  CustomerInputData,
  CustomerRecord,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function loadSampleData(): Promise<{ success: boolean; summary: DashboardSummary }> {
  const res = await fetch(`${API_BASE}/sample-data`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to load sample dataset');
  }
  return res.json();
}

export async function uploadCsvFile(csvContent: string): Promise<{
  success: boolean;
  message: string;
  data: any;
  summary: DashboardSummary;
}> {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: csvContent,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to parse CSV file');
  }
  return res.json();
}

export async function getElbowCurve(features?: string[]): Promise<ElbowResponse> {
  const res = await fetch(`${API_BASE}/elbow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to compute Elbow curve');
  }
  return res.json();
}

export async function runClustering(
  k: number,
  features?: string[]
): Promise<{ success: boolean; summary: DashboardSummary }> {
  const res = await fetch(`${API_BASE}/cluster`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ k, features }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to run clustering');
  }
  return res.json();
}

export async function predictCustomer(
  input: CustomerInputData
): Promise<{ success: boolean; prediction: PredictionResult }> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to predict segment');
  }
  return res.json();
}

export async function fetchSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/cluster-summary`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to fetch cluster summary');
  }
  return res.json();
}

export async function fetchCustomers(params: {
  page: number;
  limit: number;
  search?: string;
  cluster?: number | null;
  sort_by?: string;
  sort_order?: string;
}): Promise<{
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  data: CustomerRecord[];
}> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.cluster !== null && params.cluster !== undefined && params.cluster >= 0) {
    query.set('cluster', String(params.cluster));
  }
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const res = await fetch(`${API_BASE}/customers?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Failed to fetch customer records');
  }
  return res.json();
}

export function getDownloadUrl(): string {
  return `${API_BASE}/download`;
}
