# Customer Segmentation Using K-Means Clustering

An academic, full-stack machine learning web application demonstrating how unsupervised **K-Means Clustering** groups customers based on demographic and purchasing behaviors.

---

## 1. Problem Statement

Modern retailers and e-commerce enterprises capture vast amounts of customer transaction logs. However, customers have vastly different financial capacities, shopping habits, and product preferences. 

Treating all customers uniformly with generic, "one-size-fits-all" marketing leads to:
* High customer churn rates and low engagement.
* Inefficient marketing ad expenditures.
* Missed revenue opportunities on high-value customers.

Manually categorizing thousands of customers is subjective, error-prone, and unscalable. Unsupervised machine learning provides an automated, mathematical approach to discover natural customer segments without requiring manual labels.

---

## 2. Main Objective

To design and deploy a complete, interactive full-stack web application where students, data scientists, and business stakeholders can:
1. Understand the core principles of unsupervised machine learning.
2. Ingest, clean, and standardize multi-attribute customer datasets.
3. Compute and visualize the **Elbow Method** curve to determine a suitable value of $K$.
4. Train the **K-Means Clustering** algorithm with reproducible hyperparameters.
5. Project multi-dimensional customer spaces onto interactive 2D scatter plots with centroid crosshairs.
6. Automatically translate mathematical cluster centroids into actionable marketing personas (e.g., *High-Value Loyal Customers*, *Careful Savers*, *Aspirational Trendsetters*).
7. Score incoming customer profiles in real time using Euclidean distance against pre-fitted centroids.
8. Export the segmented customer dataset as a downloadable CSV.

---

## 3. Technology Stack

### Frontend
* **Framework:** React 19 (TypeScript) with Vite
* **Styling:** Tailwind CSS with Plus Jakarta Sans & JetBrains Mono typography
* **Data Visualization:** Recharts (Scatter plots, Bar charts, Line charts)
* **Icons:** Lucide React

### Backend
* **API Framework:** Python FastAPI & Uvicorn (plus full-stack Express server for preview runtime)
* **Machine Learning:** scikit-learn (`StandardScaler`, `KMeans`)
* **Data Processing:** pandas, NumPy
* **Data Format:** CSV and RESTful JSON

---

## 4. Machine Learning Workflow

```text
Customer Dataset (CSV)
         ↓
Data Cleaning & Missing Value Handling (Mean Imputation)
         ↓
Feature Selection (Income, Spending, Frequency, AOV, Visits)
         ↓
Feature Standardization (StandardScaler: z = (x - μ) / σ)
         ↓
Elbow Method Analysis (Inertia evaluated across K=2..10)
         ↓
Select Hyperparameter K
         ↓
K-Means Training (k-means++ initialization, random_state=42)
         ↓
Cluster Assignment (Argmin Euclidean Distance)
         ↓
Centroid Reverse-Scaling (Inverse transform back to natural units)
         ↓
Cluster Profiling & Dynamic Semantic Personas
         ↓
Actionable Marketing Recommendations
```

---

## 5. Mathematical Foundations

### 5.1 StandardScaler Normalization
Distance-based clustering algorithms are sensitive to differences in feature magnitudes:
* Annual Income: $\$15,000 \dots \$140,000$ (differences of $10^4$)
* Purchase Frequency: $1 \dots 40$ (differences of $10^1$)

Without normalization, the distance metric would be mathematically dominated by Annual Income by over 99.9%. StandardScaler transforms each feature to have a mean of $0$ and standard deviation of $1$:

$$z = \frac{x - \mu}{\sigma}$$

### 5.2 Euclidean Distance Metric
The distance between a standardized customer vector $x = (x_1, \dots, x_D)$ and a cluster centroid $c = (c_1, \dots, c_D)$:

$$d(x, c) = \sqrt{\sum_{j=1}^D (x_j - c_j)^2}$$

### 5.3 Inertia (Within-Cluster Sum of Squares)
Measures the compactness of clusters:

$$\text{Inertia} = \sum_{k=1}^K \sum_{x_i \in C_k} \| x_i - \mu_k \|^2$$

### 5.4 The Elbow Method
As $K$ increases, inertia monotonically decreases. The **Elbow Method** identifies the "elbow point" where the rate of decrease slows down, representing the point of diminishing returns.

> *Note:* The Elbow Method is a practical empirical heuristic, not a mathematically infallible formula.

---

## 6. Discovered Customer Segments & Personas

Rather than static strings, segment personas are dynamically computed based on centroid ratios compared to dataset averages:

| Segment Name | Typical Characteristics | Strategic Marketing Recommendation |
| :--- | :--- | :--- |
| **High-Value Loyal Customers** | High Income, High Spending, High AOV | VIP loyalty programs, concierge support, exclusive product pre-releases |
| **High-Income Low-Spending (Careful Savers)** | High Income, Low Spending Score | Value-justification campaigns, durability proof, trial guarantees |
| **Budget-Conscious High-Spending (Trendsetters)** | Modest Income, High Spending Score | Buy-Now-Pay-Later (BNPL), flash sales, influencer campaigns |
| **Low-Engagement Budget Customers** | Low Income, Low Spending Score | Re-engagement automated emails, clearance deals, free shipping vouchers |
| **Balanced Core Customers** | Moderate Income, Moderate Spending | Standard loyalty points accrual, seasonal discounts, bestseller highlights |

---

## 7. Project Directory Structure

```text
customer-segmentation/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & CORS
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── api.py           # REST endpoints (/api/cluster, /api/predict, etc.)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── cluster_service.py # State management & dataset caching
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── preprocessing.py # StandardScaler fit & transform
│   │   │   ├── clustering.py    # KMeans fitting & dynamic persona profiling
│   │   │   └── prediction.py    # Inference & Euclidean distance breakdown
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py       # Math helpers & formatting
│   ├── data/
│   │   └── customers.csv        # 500 synthetic customer records
│   └── requirements.txt         # Python dependencies
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation bar with active model status
│   │   ├── Footer.tsx           # Academic credits & integrity notice
│   │   ├── WorkflowStepper.tsx  # 7-step guided ML pipeline stepper
│   │   ├── MetricsCards.tsx     # KPI summary cards
│   │   ├── ScatterPlot.tsx      # 2D Income vs Spending cluster scatter plot
│   │   ├── ClusterDistChart.tsx # Customer count & percentage bar chart
│   │   ├── ClusterMetricsCharts.tsx # Purchase frequency & AOV charts
│   │   └── ClusterSummaryTable.tsx  # Statistical summary table
│   ├── pages/
│   │   ├── HomePage.tsx         # Hero section & core principles
│   │   ├── DashboardPage.tsx    # Interactive analytics dashboard
│   │   ├── DatasetPage.tsx      # CSV upload, validation & data explorer
│   │   ├── ClusteringPage.tsx   # Elbow Method curve & K-Means trainer
│   │   ├── PredictionPage.tsx   # Live customer scoring simulator
│   │   ├── ClusterAnalysisPage.tsx # In-depth segment personas & marketing playbooks
│   │   ├── LearnPage.tsx        # Theory tutorial & viva examination prep
│   │   └── AboutPage.tsx        # Architecture diagram & viva defense Q&A
│   ├── services/
│   │   └── api.ts               # Client-side API layer
│   ├── types.ts                 # TypeScript data contracts
│   ├── App.tsx                  # Root state & page router
│   ├── main.tsx                 # DOM mounting
│   └── index.css                # Tailwind CSS layers & styling
│
├── data/
│   └── customers.csv            # Root sample dataset
├── server.ts                    # Full-stack server with Vite middleware
├── package.json
├── tsconfig.json
└── README.md
```

---

## 8. Installation & Setup Instructions

### Option A: Local Full-Stack Node Runtime (Integrated Dev Server)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (runs full-stack Express + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

### Option B: Dedicated Python FastAPI Backend + React Frontend

#### 1. Backend Setup (FastAPI):
```bash
cd backend
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI documentation will be accessible at `http://localhost:8000/docs`.

#### 2. Frontend Setup (React/Vite):
```bash
# In another terminal window:
npm install
npm run dev
```

*(Optional: Set `VITE_API_BASE_URL=http://localhost:8000/api` in `.env` if connecting to the standalone FastAPI server).*

---

## 9. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check verifying model status, K, and feature count. |
| `GET` | `/api/sample-data` | Loads pre-bundled 500-customer dataset and runs baseline clustering. |
| `POST` | `/api/upload` | Ingests and validates custom customer CSV text. |
| `POST` | `/api/elbow` | Computes inertia values across $K=2 \dots 10$ and recommends optimal $K$. |
| `POST` | `/api/cluster` | Executes K-Means with specified $K$ and chosen features. |
| `POST` | `/api/predict` | Computes Euclidean distances to all centroids and assigns segment. |
| `GET` | `/api/cluster-summary` | Retrieves current metrics, centroid positions, and scatter points. |
| `GET` | `/api/customers` | Searchable, paginated, sortable table of clustered customer records. |
| `GET` | `/api/download` | Exports `clustered_customers.csv` containing assigned clusters. |

---

## 10. Viva Voce Examination Defense Guide (For Students)

* **Q: Why is K-Means called an unsupervised algorithm?**
  * **A:** Because customer records lack ground-truth target labels. The algorithm discovers structure autonomously through geometric proximity.
* **Q: Why must we use StandardScaler before K-Means?**
  * **A:** K-Means optimizes Euclidean distance. Features with large numerical ranges (e.g. Income $\$100,000$) would completely overwhelm smaller features (e.g. Purchase Frequency $12$). StandardScaler scales all features to mean $= 0$ and variance $= 1$.
* **Q: How does prediction work without refitting?**
  * **A:** Incoming customer records are transformed using the *already-fitted* scaler (stored means $\mu$ and std $\sigma$). The Euclidean distance to each stored centroid in scaled space is calculated, and the argmin distance determines the cluster.

---

## 11. Academic Machine Learning Integrity Disclaimer

K-Means identifies groups based on geometric similarity in the selected feature space. Discovered clusters are analytical descriptions, not biological or psychological ground truth. Changing features, scaling approaches, or random seeds will alter the cluster boundaries.
