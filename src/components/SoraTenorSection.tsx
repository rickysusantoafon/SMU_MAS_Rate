import React from 'react';
import { TrendingUp, TrendingDown, Minus, Check, ArrowRight } from 'lucide-react';
import { SoraSummary, SoraTenor } from '../types/sora';
import { formatPercent, formatBps } from '../utils/calculator';

interface SoraTenorSectionProps {
  summary: SoraSummary;
  selectedTenor: SoraTenor;
  onSelectTenor: (tenor: SoraTenor) => void;
  onOpenBackendModal: () => void;
}

export const SoraTenorSection: React.FC<SoraTenorSectionProps> = ({
  summary,
  selectedTenor,
  onSelectTenor,
  onOpenBackendModal,
}) => {
  // Generate simple sparkline SVG path from rate series
  const renderSparkline = (points: number[], color: string) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 0.001;
    const width = 120;
    const height = 28;

    const pathData = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const getDeltaDisplay = (deltaBps: number) => {
    if (Math.abs(deltaBps) < 0.05) {
      return (
        <span className="inline-flex items-center text-xs font-medium text-slate-500 font-mono">
          <Minus className="w-3 h-3 mr-0.5" />
          <span>0.0 bps</span>
        </span>
      );
    }
    if (deltaBps > 0) {
      return (
        <span className="inline-flex items-center text-xs font-medium text-rose-600 font-mono">
          <TrendingUp className="w-3 h-3 mr-0.5" />
          <span>+{deltaBps.toFixed(1)} bps</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-600 font-mono">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        <span>{deltaBps.toFixed(1)} bps</span>
      </span>
    );
  };

  // Sparkline data slices
  const recentHistory = summary.history.slice(-30);
  const sparkToday = recentHistory.map((r) => r.overnightRate);
  const spark1M = recentHistory.map((r) => r.compounded1M);
  const spark3M = recentHistory.map((r) => r.compounded3M);
  const spark6M = recentHistory.map((r) => r.compounded6M);

  const tenorsList = [
    {
      id: 'today' as SoraTenor,
      tag: 'Today',
      title: 'Overnight SORA',
      rate: summary.today.rate,
      deltaBps: summary.today.deltaBps,
      spark: sparkToday,
      metaItems: [
        `Date ${summary.today.date}`,
        `Vol S$ ${(summary.today.volumeMillion / 1000).toFixed(2)}B`,
        'Daily reset',
      ],
      description: 'Volume-weighted average rate of unsecured overnight interbank SGD transactions.',
      tagHighlight: 'Interbank Benchmark',
    },
    {
      id: '1m' as SoraTenor,
      tag: 'Past Month',
      title: '1-Month Compounded SORA',
      rate: summary.pastMonth.rate,
      deltaBps: summary.pastMonth.deltaBps,
      spark: spark1M,
      metaItems: [
        `30d Min ${summary.pastMonth.min.toFixed(4)}%`,
        `30d Max ${summary.pastMonth.max.toFixed(4)}%`,
        'Monthly reset',
      ],
      description: 'Compounded average over preceding 30 days. Fast tracking for falling rate cycles.',
      tagHighlight: 'Short-Term Floating',
    },
    {
      id: '3m' as SoraTenor,
      tag: 'Past 3 Months',
      title: '3-Month Compounded SORA',
      rate: summary.past3Months.rate,
      deltaBps: summary.past3Months.deltaBps,
      spark: spark3M,
      metaItems: [
        `90d Min ${summary.past3Months.min.toFixed(4)}%`,
        `90d Max ${summary.past3Months.max.toFixed(4)}%`,
        'Quarterly reset',
      ],
      description: 'Compounded over preceding 90 days. The gold standard for Singapore bank home loans.',
      tagHighlight: 'Bank Home Loan Standard',
      isPopular: true,
    },
    {
      id: '6m' as SoraTenor,
      tag: 'Past 6 Months',
      title: '6-Month Compounded SORA',
      rate: summary.past6Months.rate,
      deltaBps: summary.past6Months.deltaBps,
      spark: spark6M,
      metaItems: [
        `180d Min ${summary.past6Months.min.toFixed(4)}%`,
        `180d Max ${summary.past6Months.max.toFixed(4)}%`,
        'Semi-annual reset',
      ],
      description: 'Compounded over preceding 180 days. Smoothest rate trajectory and low volatility.',
      tagHighlight: 'High Stability',
    },
  ];

  return (
    <section id="rates-overview" className="scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Monetary Authority of Singapore (MAS) Benchmark</span>
            <span aria-hidden="true">·</span>
            <span>Published Daily at 9:00 AM SGT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Singapore SORA Rate Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Live Singapore Overnight Rate Average benchmarks across daily, 1-month, 3-month, and 6-month compounded tenors.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
          <span>Data Source: <strong className="text-slate-800 font-semibold">{summary.dataSource === 'custom_backend' ? 'User Backend' : summary.dataSource === 'mas_api' ? 'MAS Open API' : 'MAS Calibrated Feed'}</strong></span>
          <span aria-hidden="true">·</span>
          <button
            onClick={onOpenBackendModal}
            className="text-sky-600 hover:text-sky-700 font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Backend Status</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Four Core Tenor Cards Grid: Today, Past Month, Past 3 Months, Past 6 Months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tenorsList.map((item) => {
          const isSelected = selectedTenor === item.id;
          const sparkColor = item.deltaBps > 0 ? '#e11d48' : item.deltaBps < 0 ? '#059669' : '#64748b';

          return (
            <div
              key={item.id}
              onClick={() => onSelectTenor(item.id)}
              className={`group relative bg-white rounded-lg border p-5 cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-400 hover:shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {item.tag}
                </span>

                {item.isPopular ? (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    Most Popular
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">
                    {item.tagHighlight}
                  </span>
                )}
              </div>

              {/* Tenor Title */}
              <h2 className="text-sm font-semibold text-slate-900 mb-3 truncate">
                {item.title}
              </h2>

              {/* Rate & Delta */}
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                  {formatPercent(item.rate, 4)}
                </div>
                <div>{getDeltaDisplay(item.deltaBps)}</div>
              </div>

              {/* Sparkline Visual */}
              <div className="py-1 mb-3 flex items-center justify-between border-t border-b border-slate-100">
                <span className="text-[11px] text-slate-600">30d trajectory</span>
                {renderSparkline(item.spark, sparkColor)}
              </div>

              {/* Metadata with Zero-Pill Typographic Separators */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 mb-3 font-mono">
                {item.metaItems.map((meta, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-500" aria-hidden="true">·</span>}
                    <span>{meta}</span>
                  </React.Fragment>
                ))}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {item.description}
              </p>

              {/* Bottom Card Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  {isSelected ? 'Active in Calculator' : 'Use in Calculator'}
                </span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-700'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
