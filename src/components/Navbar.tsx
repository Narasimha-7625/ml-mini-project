import React from 'react';
import {
  Users,
  LayoutDashboard,
  Database,
  GitBranch,
  UserCheck,
  PieChart,
  BookOpen,
  Info,
  Layers,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'dashboard'
  | 'dataset'
  | 'clustering'
  | 'prediction'
  | 'analysis'
  | 'learn'
  | 'about';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  customerCount: number;
  currentK: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  customerCount,
  currentK,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'dataset', label: 'Dataset', icon: <Database className="w-4 h-4" /> },
    { id: 'clustering', label: 'Elbow & K-Means', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'prediction', label: 'Predict Segment', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'analysis', label: 'Cluster Analysis', icon: <PieChart className="w-4 h-4" /> },
    { id: 'learn', label: 'Learn K-Means', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'about', label: 'About Project', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Academic Badge */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Customer Segmentation
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ML Mini-Project
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Unsupervised Learning • K-Means & StandardScaler
              </p>
            </div>
          </div>

          {/* Model Status Pill */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 text-slate-300">
            <span className="inline-flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200">Model Active</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>{customerCount} Records</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-indigo-400">K = {currentK}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-sm">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
