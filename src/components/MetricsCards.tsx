import React from 'react';
import { Users, GitBranch, DollarSign, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardSummary } from '../types';

interface MetricsCardsProps {
  summary: DashboardSummary | null;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Customers',
      value: summary.total_customers.toLocaleString(),
      subtitle: `${summary.selected_features.length} features analyzed`,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-950/20',
    },
    {
      title: 'Number of Clusters (K)',
      value: `K = ${summary.k}`,
      subtitle: `Inertia: ${summary.inertia.toLocaleString()}`,
      icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
    },
    {
      title: 'Average Income',
      value: `$${Math.round(summary.avg_income).toLocaleString()}`,
      subtitle: 'Annualized customer mean',
      icon: <DollarSign className="w-5 h-5 text-blue-400" />,
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/20',
    },
    {
      title: 'Average Spending Score',
      value: `${Math.round(summary.avg_spending)} / 100`,
      subtitle: 'Behavioral index metric',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
    },
    {
      title: 'Highest Spending Segment',
      value: summary.highest_spending_segment,
      subtitle: 'Primary high-value targets',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      isText: true,
    },
    {
      title: 'Lowest Spending Segment',
      value: summary.lowest_spending_segment,
      subtitle: 'Re-engagement / Discount focus',
      icon: <TrendingDown className="w-5 h-5 text-rose-400" />,
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/20',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl bg-slate-900/90 border ${card.border} flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`p-2 rounded-xl ${card.bg}`}>{card.icon}</div>
          </div>
          <div>
            <div
              className={`font-bold tracking-tight text-slate-100 ${
                card.isText ? 'text-sm leading-snug line-clamp-2' : 'text-2xl'
              }`}
            >
              {card.value}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
