import fs from 'fs';
import path from 'path';

// Seeded pseudorandom number generator for reproducibility
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

function randBetween(min: number, max: number): number {
  return min + rng() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max + 1));
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

interface CustomerRow {
  CustomerID: string;
  Age: number;
  Gender: string;
  AnnualIncome: number;
  SpendingScore: number;
  PurchaseFrequency: number;
  AverageOrderValue: number;
  WebsiteVisits: number;
  CustomerLoyaltyYears: number;
}

const archetypes = [
  // 1: High-Value Loyal (Affluent, heavy spenders)
  {
    weight: 0.22,
    age: [32, 58],
    income: [85000, 140000],
    spending: [75, 98],
    freq: [20, 42],
    aov: [220, 480],
    visits: [18, 45],
    loyalty: [3, 10],
  },
  // 2: High-Income Savers (Cautious affluent)
  {
    weight: 0.20,
    age: [36, 68],
    income: [80000, 135000],
    spending: [12, 38],
    freq: [4, 12],
    aov: [130, 260],
    visits: [5, 18],
    loyalty: [2, 9],
  },
  // 3: Budget High-Spenders (Young trendsetters/aspirational)
  {
    weight: 0.20,
    age: [19, 34],
    income: [18000, 42000],
    spending: [68, 96],
    freq: [16, 36],
    aov: [35, 95],
    visits: [24, 52],
    loyalty: [1, 4],
  },
  // 4: Low-Engagement / Budget Shoppers
  {
    weight: 0.18,
    age: [24, 66],
    income: [16000, 40000],
    spending: [8, 35],
    freq: [2, 9],
    aov: [25, 75],
    visits: [3, 16],
    loyalty: [0, 5],
  },
  // 5: Balanced Middle Market (Steady core)
  {
    weight: 0.20,
    age: [25, 60],
    income: [46000, 78000],
    spending: [40, 64],
    freq: [9, 20],
    aov: [75, 160],
    visits: [10, 26],
    loyalty: [2, 7],
  },
];

const totalRows = 500;
const rows: CustomerRow[] = [];

for (let i = 1; i <= totalRows; i++) {
  const p = rng();
  let cumulative = 0;
  let selected = archetypes[archetypes.length - 1];
  for (const arc of archetypes) {
    cumulative += arc.weight;
    if (p <= cumulative) {
      selected = arc;
      break;
    }
  }

  const customerId = `C${String(i).padStart(3, '0')}`;
  const gender = randChoice(['Male', 'Female']);
  const age = randInt(selected.age[0], selected.age[1]);
  // Round income to nearest 500
  const income = Math.round(randBetween(selected.income[0], selected.income[1]) / 500) * 500;
  const spending = randInt(selected.spending[0], selected.spending[1]);
  const freq = randInt(selected.freq[0], selected.freq[1]);
  const aov = Math.round(randBetween(selected.aov[0], selected.aov[1]));
  const visits = randInt(selected.visits[0], selected.visits[1]);
  const loyalty = randInt(selected.loyalty[0], selected.loyalty[1]);

  rows.push({
    CustomerID: customerId,
    Age: age,
    Gender: gender,
    AnnualIncome: income,
    SpendingScore: spending,
    PurchaseFrequency: freq,
    AverageOrderValue: aov,
    WebsiteVisits: visits,
    CustomerLoyaltyYears: loyalty,
  });
}

const header = 'CustomerID,Age,Gender,AnnualIncome,SpendingScore,PurchaseFrequency,AverageOrderValue,WebsiteVisits,CustomerLoyaltyYears';
const csvContent = [
  header,
  ...rows.map(
    (r) =>
      `${r.CustomerID},${r.Age},${r.Gender},${r.AnnualIncome},${r.SpendingScore},${r.PurchaseFrequency},${r.AverageOrderValue},${r.WebsiteVisits},${r.CustomerLoyaltyYears}`
  ),
].join('\n');

const dirs = ['./data', './backend/data'];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'customers.csv'), csvContent);
}

console.log(`Generated ${rows.length} records successfully in data/customers.csv and backend/data/customers.csv`);
