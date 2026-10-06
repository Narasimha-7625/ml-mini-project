import React from 'react';
import {
  BookOpen,
  Cpu,
  HelpCircle,
  Calculator,
  Compass,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const LearnPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Guide • Viva Voce Preparation</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Learn K-Means Clustering
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Comprehensive theoretical foundation and mathematical principles designed for
          computer science students, viva examinations, and data science demonstrations.
        </p>
      </div>

      {/* Conceptual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. What is Machine Learning */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-indigo-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">1. What is Machine Learning?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Machine Learning (ML) is a branch of Artificial Intelligence where computer algorithms learn
            patterns directly from empirical data without being explicitly programmed with rigid deterministic
            if-else rules. As algorithms encounter more observations, their model parameters adapt to optimize
            a specified mathematical objective function.
          </p>
        </div>

        {/* 2. What is Unsupervised Learning */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <Compass className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">2. What is Unsupervised Learning?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike supervised learning—where each training sample has a known target label (e.g. churn = 1 or 0)—
            unsupervised learning operates on <strong>unlabelled data</strong>. The algorithm must discover the
            intrinsic hidden structure, natural density distributions, or relationships among customer vectors
            entirely autonomously.
          </p>
        </div>

        {/* 3. What is Clustering */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Layers className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">3. What is Clustering?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Clustering is the unsupervised task of partitioning a collection of records into distinct groups
            (clusters) such that records assigned to the same cluster share high similarity with one another
            (<strong>high intra-cluster homogeneity</strong>), while records in different clusters are maximally
            dissimilar (<strong>high inter-cluster separation</strong>).
          </p>
        </div>

        {/* 4. What is K-Means */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-purple-400">
            <GitBranch className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">4. What is K-Means?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            K-Means is a centroid-based partitioning algorithm that divides $N$ observations into $K$ disjoint
            clusters. Each cluster is parameterized by a centroid. The algorithm iteratively minimizes the sum
            of squared Euclidean distances from data points to their respective centroids until convergence.
          </p>
        </div>
      </div>

      {/* Deep-Dive Math Cards */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Mathematical Foundations & Mechanics</h3>

        {/* What is a Centroid? */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>What is a Centroid?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            A centroid is the arithmetic center (mean point) representing an entire cluster in multi-dimensional space.
            For a cluster $C_k$ containing $N_k$ customer vectors, the centroid $\mu_k$ is calculated as:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-center text-indigo-300 text-xs sm:text-sm border border-slate-800">
            centroid_k = (1 / N_k) * SUM[ x_i for x_i in Cluster_k ]
          </div>
          <p className="text-xs text-slate-400">
            In our customer application, each centroid coordinate corresponds to the average Annual Income,
            Spending Score, Purchase Frequency, Order Value, and Web Visits of customers in that segment.
          </p>
        </div>

        {/* Euclidean Distance & Worked Example */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h4 className="text-base font-bold text-white flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Euclidean Distance Formula & Worked Example</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The straight-line geometric distance between a customer feature vector $x = (x_1, x_2, \dots, x_D)$
            and a cluster centroid $c = (c_1, c_2, \dots, c_D)$ across $D$ dimensions:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-center text-emerald-300 text-xs sm:text-sm border border-slate-800">
            d(x, c) = sqrt( sum( (x_j - c_j)^2 ) )
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white">Conceptual Scoring Example:</div>
            <p className="text-slate-300">
              When a new customer record is passed to the prediction endpoint:
            </p>
            <div className="font-mono text-xs text-slate-300 space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div>Customer → Cluster 1 distance = 2.10</div>
              <div className="text-emerald-400 font-bold">
                Customer → Cluster 2 distance = 0.80 &nbsp;← Minimal Distance (Argmin)
              </div>
              <div>Customer → Cluster 3 distance = 3.40</div>
            </div>
            <p className="text-emerald-300 font-medium">
              Therefore: The customer is assigned to <strong>Cluster 2</strong>.
            </p>
          </div>
        </div>

        {/* What is Inertia? */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span>What is Inertia (Within-Cluster Sum of Squares)?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inertia measures how tightly clustered the data points are around their assigned centroids.
            It is defined as the sum of squared Euclidean distances from each data point to its assigned cluster center:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-center text-amber-300 text-xs sm:text-sm border border-slate-800">
            Inertia = SUM[ (x_i - centroid_assigned)^2 for all customer records ]
          </div>
          <p className="text-xs text-slate-400">
            Lower inertia indicates more compact clusters. However, inertia always decreases as $K$ increases
            (if $K = N$, inertia = 0). This is why the Elbow Method is used to identify the sweet spot.
          </p>
        </div>

        {/* Why StandardScaler is Mandatory */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Why is StandardScaler Mandatory for K-Means?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Because K-Means relies entirely on Euclidean distances, features with large numerical ranges
            will mathematically dominate the distance calculation if unscaled.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-850 text-xs space-y-2">
            <div className="font-semibold text-rose-300">The Problem Without Scaling:</div>
            <p className="text-slate-300">
              Annual Income ranges from <strong>$15,000 to $140,000</strong> (differences of $20,000 = $(20,000)^2 = 400,000,000$).
              Purchase Frequency ranges from <strong>1 to 40</strong> (differences of $5 = 5^2 = 25$).
              Without scaling, the income column would account for 99.999% of the distance metric, rendering
              purchase frequency and loyalty years completely useless!
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-center text-indigo-300 text-xs border border-slate-800">
            StandardScaler: z = (x - μ) / σ
          </div>
          <p className="text-xs text-slate-400">
            StandardScaler standardizes each feature to have a mean of 0 ($\mu = 0$) and standard deviation
            of 1 ($\sigma = 1$), placing every behavioral feature on an equal footing.
          </p>
        </div>

        {/* What is the Elbow Method? */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-base font-bold text-white flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span>What is the Elbow Method?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Elbow Method is a heuristic used to determine the optimal number of clusters $K$.
            We compute and plot the model&apos;s inertia across multiple values of $K$ (e.g. $K=2$ to $10$).
            At low values of $K$, adding another cluster drastically reduces inertia. Beyond a certain point,
            adding more clusters only yields marginal reductions in inertia, forming an &quot;elbow&quot; on the curve.
          </p>
          <p className="text-xs text-slate-400">
            The elbow represents the point of diminishing returns—the optimal balance between cluster compactness
            and model interpretability.
          </p>
        </div>
      </div>

      {/* Academic Disclaimer Box */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-start space-x-3.5 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold text-sm">
            Viva Voce ML Integrity Requirement
          </strong>
          <p className="text-slate-300 leading-relaxed">
            Never claim that K-Means discovers objectively &quot;true&quot; customer classifications.
            Clusters are mathematical groupings based on Euclidean proximity in standardized feature space.
            Changing features, scaling techniques, random seeds, or K will result in different partitions.
          </p>
        </div>
      </div>
    </div>
  );
};
