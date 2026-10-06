import React from 'react';
import { BookOpen, ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">
            Customer Segmentation Using K-Means Clustering
          </span>
          <span className="text-slate-600">|</span>
          <span>Academic Machine Learning Demonstration</span>
        </div>

        <div className="flex items-center space-x-6 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>StandardScaler Preprocessing</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Elbow Heuristic Inertia</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 text-center md:text-left">
        <strong>Academic ML Integrity Notice:</strong> K-Means identifies mathematical distance clusters
        in scaled coordinate space. Discovered segments are analytical behavioral descriptions, not ground-truth
        classifications.
      </div>
    </footer>
  );
};
