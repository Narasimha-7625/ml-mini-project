import React from 'react';
import { NavTab } from '../components/Navbar';
import {
  Sparkles,
  ArrowRight,
  Database,
  GitBranch,
  BookOpen,
  PieChart,
  UserCheck,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
  customerCount: number;
  currentK: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  customerCount,
  currentK,
}) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Mini-Project • Machine Learning & Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Customer Segmentation <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Using K-Means Clustering
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Discover hidden customer groups using unsupervised machine learning. Standardize multidimensional
            demographic and purchasing behaviors, evaluate the Elbow Method curve, and transform numerical
            centroids into targeted marketing strategies.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('dataset')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Explore Dataset</span>
            </button>
            <button
              onClick={() => onNavigate('clustering')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Run Clustering</span>
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="px-6 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Learn K-Means</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex items-center space-x-6 text-xs text-slate-400 border-t border-slate-800/80">
            <div>
              <span className="font-bold text-white text-sm">{customerCount}</span> Active Customers
            </div>
            <div>
              <span className="font-bold text-indigo-400 text-sm">K = {currentK}</span> Optimal Clusters
            </div>
            <div>
              <span className="font-bold text-emerald-400 text-sm">StandardScaler</span> Normalized
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-purple-400 text-sm">Euclidean</span> Distance Metric
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight Cards */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Core Machine Learning Principles
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered to demonstrate essential unsupervised learning fundamentals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Unsupervised Learning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike supervised classification, customer records lack predefined category labels.
              K-Means automatically discovers underlying natural groups based on geometric proximity in feature space.
            </p>
            <div className="pt-2 text-xs font-semibold text-indigo-400 flex items-center space-x-1">
              <span>Iterative Centroid Optimization</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Customer Insights</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Centroid coordinates are automatically converted from standardized math space back into
              real-world dollars and transactions, generating dynamic behavioral personas (VIPs, Savers, Trendsetters).
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <span>Automatic Persona Interpretation</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Data-Driven Segmentation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enables targeted marketing budget allocation, personalized retention campaigns, customized
              loyalty rewards, and conversion rate optimization based on empirical data patterns.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-400 flex items-center space-x-1">
              <span>Actionable Marketing Strategies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Flowchart Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">The K-Means Pipeline Architecture</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              From raw customer transactions to actionable segment scoring
            </p>
          </div>
          <button
            onClick={() => onNavigate('about')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>View Technical Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'CSV cleaning & validation' },
            { step: '02', title: 'StandardScaler', desc: 'Z-score normalization' },
            { step: '03', title: 'Elbow Analysis', desc: 'Inertia curve evaluation' },
            { step: '04', title: 'K-Means Fit', desc: 'Random seed 42, n_init=10' },
            { step: '05', title: 'Profiling', desc: 'Centroid reverse scaling' },
            { step: '06', title: 'Inference', desc: 'Euclidean distance scoring' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.step}</span>
              <div className="font-semibold text-white text-xs">{item.title}</div>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer Box */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-start space-x-3.5 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold text-sm">
            Important Academic Machine Learning Integrity Notice
          </strong>
          <p className="text-slate-300 leading-relaxed">
            K-Means identifies groups based on geometric similarity in the selected feature space.
            Cluster interpretations are analytical behavioral descriptions, not ground-truth customer
            classifications. Modifying the dataset, selecting different features, changing scaling methods,
            or altering K will yield different segment boundaries.
          </p>
        </div>
      </div>
    </div>
  );
};
