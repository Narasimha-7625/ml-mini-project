/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetPage } from './pages/DatasetPage';
import { ClusteringPage } from './pages/ClusteringPage';
import { PredictionPage } from './pages/PredictionPage';
import { ClusterAnalysisPage } from './pages/ClusterAnalysisPage';
import { LearnPage } from './pages/LearnPage';
import { AboutPage } from './pages/AboutPage';
import { DashboardSummary } from './types';
import { fetchSummary, loadSampleData } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try fetching current summary first
      let data = await fetchSummary().catch(() => null);
      if (!data || !data.total_customers) {
        const res = await loadSampleData();
        data = res.summary;
      }
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to initialize app data:', err);
      setError(err.message || 'Failed to initialize customer model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSelectCluster = (clusterId: number) => {
    setSelectedClusterId(clusterId);
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customerCount={summary?.total_customers || 0}
        currentK={summary?.k || 5}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={initData}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <HomePage
            onNavigate={setActiveTab}
            customerCount={summary?.total_customers || 0}
            currentK={summary?.k || 5}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            summary={summary}
            loading={loading}
            onRefresh={initData}
            onNavigate={setActiveTab}
            onSelectCluster={handleSelectCluster}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetPage
            summary={summary}
            onDatasetUpdated={(newSummary) => setSummary(newSummary)}
          />
        )}

        {activeTab === 'clustering' && (
          <ClusteringPage
            summary={summary}
            onClusteringComplete={(newSummary) => setSummary(newSummary)}
          />
        )}

        {activeTab === 'prediction' && <PredictionPage />}

        {activeTab === 'analysis' && (
          <ClusterAnalysisPage
            summary={summary}
            selectedClusterId={selectedClusterId}
          />
        )}

        {activeTab === 'learn' && <LearnPage />}

        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Academic Footer */}
      <Footer />
    </div>
  );
}
