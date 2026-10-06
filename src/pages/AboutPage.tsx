import React from 'react';
import {
  Info,
  Server,
  Layers,
  Cpu,
  Database,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Code2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Info className="w-3.5 h-3.5" />
          <span>Academic Project Overview & Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          About The Project & Technical Architecture
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Full-stack machine learning mini-project engineered for academic demonstrations,
          viva defense evaluations, and real-world customer analytics.
        </p>
      </div>

      {/* Problem, Solution, Input, Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <h3 className="text-base font-bold text-white">The Problem Statement</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Modern enterprises capture massive volumes of customer transaction logs. However, customers
            exhibit heterogeneous purchasing behaviors, income levels, and engagement frequencies.
            Treating all customers uniformly with one-size-fits-all marketing leads to wasted advertising
            spend, low engagement, and poor customer retention. Manually categorizing thousands of records
            is subjective, error-prone, and unscalable.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-white">The Machine Learning Solution</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Apply unsupervised K-Means Clustering to automatically partition customers into coherent,
            mathematically separated behavioral segments. By scaling multi-attribute numerical vectors with
            StandardScaler, evaluating the optimal cluster count with the Elbow Method, and reverse-mapping
            centroids into business units, organizations gain automated, actionable customer intelligence.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Database className="w-4 h-4" />
            <h3 className="text-base font-bold text-white">Input & Feature Set</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li><strong>Demographics:</strong> Age, Gender, Customer Loyalty Years.</li>
            <li><strong>Financials:</strong> Annual Income ($), Average Order Value (AOV).</li>
            <li><strong>Behavior:</strong> Spending Score (1-100), Purchase Frequency (Orders/Yr), Monthly Website Visits.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <Cpu className="w-4 h-4" />
            <h3 className="text-base font-bold text-white">Algorithm & Concrete Outputs</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li><strong>Algorithm:</strong> Scikit-Learn KMeans (k-means++ seeding, random_state=42, n_init=10).</li>
            <li><strong>Outputs:</strong> Cluster labels, centroid coordinates, inertia elbow curve, interpreted segment personas (VIPs, Savers, Trendsetters), and targeted marketing playbooks.</li>
          </ul>
        </div>
      </div>

      {/* Visual System Architecture Flowchart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white">System Architecture & Pipeline Flow</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end full-stack data flow from customer input to visual dashboard
          </p>
        </div>

        {/* Visual Pipeline Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-mono text-indigo-400 font-bold">STAGE 1</span>
            <div className="font-bold text-white">Frontend UI (React/Vite)</div>
            <p className="text-slate-400 text-[11px]">
              Responsive dashboard with interactive Recharts, CSV upload, and real-time prediction forms.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 2</span>
            <div className="font-bold text-white">FastAPI REST Backend</div>
            <p className="text-slate-400 text-[11px]">
              High-performance asynchronous endpoints managing data ingestion, validation, and JSON streaming.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 font-bold">STAGE 3</span>
            <div className="font-bold text-white">ML Preprocessing (Scaler)</div>
            <p className="text-slate-400 text-[11px]">
              Missing value imputation and scikit-learn StandardScaler normalization (mean=0, std=1).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-mono text-purple-400 font-bold">STAGE 4</span>
            <div className="font-bold text-white">K-Means Engine & Profiler</div>
            <p className="text-slate-400 text-[11px]">
              Elbow inertia evaluation, centroid convergence, dynamic persona labeling, and business recommendations.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 font-mono text-center text-xs text-indigo-300 border border-slate-800">
          Frontend &nbsp;⇄&nbsp; REST API (/api/*) &nbsp;⇄&nbsp; StandardScaler &nbsp;⇄&nbsp; KMeans(k, random_state=42) &nbsp;⇄&nbsp; Centroid Inverse Mapping &nbsp;⇄&nbsp; Dashboard & Recommendations
        </div>
      </div>

      {/* Practical Business Applications */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Real-World Business Applications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400">1. Targeted Digital Marketing</span>
            <p className="text-slate-300 text-[11px]">
              Eliminates wasted ad budgets by running distinct campaigns for high-earning cautious spenders vs.
              aspirational trendsetters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400">2. Customer Retention & Churn Prevention</span>
            <p className="text-slate-300 text-[11px]">
              Detects declining engagement in low-spending budget clusters and triggers automated re-engagement
              discounts before churn occurs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-400">3. Personalized Product Recommendations</span>
            <p className="text-slate-300 text-[11px]">
              Recommends premium luxury packages to VIP segments and budget bundles to price-sensitive segments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-400">4. Dynamic Loyalty Program Tiering</span>
            <p className="text-slate-300 text-[11px]">
              Allocates VIP concierge support and private sales access to segments with top lifetime value metrics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <span className="font-bold text-blue-400">5. Inventory & Supply Chain Optimization</span>
            <p className="text-slate-300 text-[11px]">
              Aligns product stock inventory with the demand patterns and average order values of dominant local clusters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
            <span className="font-bold text-rose-400">6. Pricing & Financing Strategy</span>
            <p className="text-slate-300 text-[11px]">
              Offers Buy Now Pay Later (BNPL) financing to high-spending, lower-income demographic clusters.
            </p>
          </div>
        </div>
      </div>

      {/* Viva Voce Quick Cheat Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">Student Viva Voce Examination Defense Q&A</h3>
        </div>
        <p className="text-xs text-slate-400">
          Frequently asked viva questions and concise answers for computer science project reviews:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Q1: Why is K-Means called an unsupervised algorithm?</div>
            <p className="text-slate-300 text-[11px]">
              <strong>Ans:</strong> Because the dataset lacks predefined target labels or ground truth outputs.
              The model discovers inherent group boundaries solely by analyzing mathematical geometric distances between feature vectors.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Q2: Why must we use StandardScaler before K-Means?</div>
            <p className="text-slate-300 text-[11px]">
              <strong>Ans:</strong> K-Means uses Euclidean distance. Features with large numerical ranges (e.g. Income $100k)
              would completely dominate differences in smaller features (e.g. Purchases 10). StandardScaler converts each feature
              to mean=0, std=1, giving every attribute equal mathematical influence.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Q3: How does new customer prediction work without refitting?</div>
            <p className="text-slate-300 text-[11px]">
              <strong>Ans:</strong> The customer&apos;s raw numbers are scaled using the <em>already-fitted</em> StandardScaler
              (using stored training means and standard deviations). We then compute the Euclidean distance to each of the $K$
              stored centroids and assign the customer to the centroid with the minimum distance (argmin).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Q4: What is the limitation of the Elbow Method?</div>
            <p className="text-slate-300 text-[11px]">
              <strong>Ans:</strong> The Elbow Method is an empirical heuristic, not an infallible mathematical proof. In real-world
              continuous data, the curve might not show a sharp elbow. It should always be combined with domain business knowledge
              and silhouette score analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
