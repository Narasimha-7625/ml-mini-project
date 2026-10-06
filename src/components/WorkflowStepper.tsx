import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { NavTab } from './Navbar';

interface Step {
  num: number;
  title: string;
  desc: string;
  tab: NavTab;
}

const STEPS: Step[] = [
  { num: 1, title: 'Load Dataset', desc: 'Import or sample CSV', tab: 'dataset' },
  { num: 2, title: 'Select Features', desc: 'Choose numeric features', tab: 'clustering' },
  { num: 3, title: 'Analyze Elbow Curve', desc: 'Evaluate inertia vs K', tab: 'clustering' },
  { num: 4, title: 'Choose K', desc: 'Set cluster count (2-10)', tab: 'clustering' },
  { num: 5, title: 'Run K-Means', desc: 'Standardize & train', tab: 'dashboard' },
  { num: 6, title: 'Explore Clusters', desc: 'Inspect scatter & profiles', tab: 'analysis' },
  { num: 7, title: 'Predict Customer', desc: 'Score new customer record', tab: 'prediction' },
];

interface WorkflowStepperProps {
  currentStep?: number;
  onSelectTab: (tab: NavTab) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep = 5,
  onSelectTab,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            End-to-End Machine Learning Pipeline
          </h3>
        </div>
        <span className="text-xs text-indigo-400 font-medium">
          Step {currentStep} of {STEPS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STEPS.map((step) => {
          const isDone = step.num < currentStep;
          const isCurrent = step.num === currentStep;

          return (
            <button
              key={step.num}
              onClick={() => onSelectTab(step.tab)}
              className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : isDone
                  ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-indigo-500 text-white'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  STEP {step.num}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-semibold text-slate-100 truncate text-[11px] sm:text-xs">
                {step.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{step.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
