import React from 'react';
import { Database, RefreshCw, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { SoraSummary } from '../types/sora';

interface HeaderProps {
  summary: SoraSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenBackendConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  isLoading,
  onRefresh,
  onOpenBackendConfig,
}) => {
  const getSourceBadge = () => {
    if (!summary) return null;
    if (summary.dataSource === 'custom_backend') {
      return {
        label: 'Custom Backend',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
      };
    }
    if (summary.dataSource === 'mas_api') {
      return {
        label: 'MAS Official API',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
      };
    }
    return {
      label: 'MAS Calibrated Feed',
      dotColor: 'bg-sky-500',
      textColor: 'text-slate-600',
    };
  };

  const badge = getSourceBadge();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a href="#rates-overview" className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors">
          SORA SG Calculator
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#rates-overview" className="hover:text-slate-900 transition-colors">Rates Overview</a>
          <a href="#calculator" className="hover:text-slate-900 transition-colors">Mortgage Calculator</a>
          <a href="#tenor-comparison" className="hover:text-slate-900 transition-colors">Tenor Comparison</a>
          <a href="#historical-trends" className="hover:text-slate-900 transition-colors">Historical Trends</a>
          <a href="#mas-methodology" className="hover:text-slate-900 transition-colors">MAS Guide</a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {badge && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 mr-1">
              <span className={`w-2 h-2 rounded-full ${badge.dotColor} animate-pulse`} aria-hidden="true" />
              <span>{badge.label}</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh latest MAS rates"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            aria-label="Refresh rates"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          <button
            onClick={onOpenBackendConfig}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>Backend Integration</span>
          </button>
        </div>
      </div>
    </header>
  );
};
