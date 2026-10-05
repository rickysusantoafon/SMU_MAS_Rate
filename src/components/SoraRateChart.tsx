import React, { useState, useMemo } from 'react';
import { Download, Search, Eye, EyeOff, BarChart3, Table as TableIcon } from 'lucide-react';
import { SoraRecord, SoraSummary } from '../types/sora';
import { formatPercent } from '../utils/calculator';

interface SoraRateChartProps {
  summary: SoraSummary;
}

type TimeframeOption = '1m' | '3m' | '6m' | 'all';

export const SoraRateChart: React.FC<SoraRateChartProps> = ({ summary }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('3m');
  const [activeSeries, setActiveSeries] = useState({
    overnight: true,
    comp1m: true,
    comp3m: true,
    comp6m: true,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [tableSearch, setTableSearch] = useState('');

  // Filter history records based on selected timeframe
  const filteredHistory = useMemo(() => {
    const total = summary.history.length;
    if (timeframe === '1m') return summary.history.slice(-21);
    if (timeframe === '3m') return summary.history.slice(-63);
    if (timeframe === '6m') return summary.history.slice(-126);
    return summary.history;
  }, [summary.history, timeframe]);

  // Calculate chart boundaries
  const { minRate, maxRate, chartData } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    filteredHistory.forEach((r) => {
      if (activeSeries.overnight) {
        min = Math.min(min, r.overnightRate);
        max = Math.max(max, r.overnightRate);
      }
      if (activeSeries.comp1m) {
        min = Math.min(min, r.compounded1M);
        max = Math.max(max, r.compounded1M);
      }
      if (activeSeries.comp3m) {
        min = Math.min(min, r.compounded3M);
        max = Math.max(max, r.compounded3M);
      }
      if (activeSeries.comp6m) {
        min = Math.min(min, r.compounded6M);
        max = Math.max(max, r.compounded6M);
      }
    });

    if (min === Infinity) {
      min = 3.0;
      max = 3.5;
    }

    // Add 8% padding to min/max
    const padding = (max - min) * 0.1 || 0.05;
    return {
      minRate: min - padding,
      maxRate: max + padding,
      chartData: filteredHistory,
    };
  }, [filteredHistory, activeSeries]);

  // SVG Chart Geometry
  const width = 800;
  const height = 300;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (chartData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (chartData.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const range = maxRate - minRate || 1;
    return paddingTop + chartH - ((val - minRate) / range) * chartH;
  };

  const createLinePath = (getter: (r: SoraRecord) => number) => {
    if (!chartData.length) return '';
    return chartData
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(getter(r)).toFixed(1)}`)
      .join(' ');
  };

  const pathOvernight = createLinePath((r) => r.overnightRate);
  const path1M = createLinePath((r) => r.compounded1M);
  const path3M = createLinePath((r) => r.compounded3M);
  const path6M = createLinePath((r) => r.compounded6M);

  // Horizontal Grid Lines
  const gridTicks = useMemo(() => {
    const count = 5;
    const ticks: number[] = [];
    const step = (maxRate - minRate) / count;
    for (let i = 0; i <= count; i++) {
      ticks.push(minRate + step * i);
    }
    return ticks;
  }, [minRate, maxRate]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = 'Date,Overnight_SORA(%),1M_Compounded(%),3M_Compounded(%),6M_Compounded(%),Volume_SGD_M\n';
    const rows = summary.history
      .map(
        (r) =>
          `${r.date},${r.overnightRate},${r.compounded1M},${r.compounded3M},${r.compounded6M},${r.volumeMillion}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAS_SORA_Rates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hoveredRecord = hoveredIndex !== null && chartData[hoveredIndex] ? chartData[hoveredIndex] : null;

  // Filtered raw records for table search
  const searchedRecords = useMemo(() => {
    if (!tableSearch.trim()) return [...summary.history].reverse();
    return [...summary.history]
      .reverse()
      .filter((r) => r.date.includes(tableSearch.trim()));
  }, [summary.history, tableSearch]);

  return (
    <section id="historical-trends" className="scroll-mt-20">
      <div className="mb-6 pb-3 border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Historical SORA Rate Trajectory
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track daily volatility and compounded tenors over 1 month, 3 months, 6 months, and up to 180 business days.
          </p>
        </div>

        {/* View mode toggle & CSV export */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'chart'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Chart View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Raw MAS Table</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
              {(
                [
                  { id: '1m', label: '1 Month' },
                  { id: '3m', label: '3 Months' },
                  { id: '6m', label: '6 Months' },
                  { id: 'all', label: 'All (180d)' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    timeframe === t.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Series Toggles */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSeries.overnight}
                  onChange={(e) =>
                    setActiveSeries({ ...activeSeries, overnight: e.target.checked })
                  }
                  className="rounded text-slate-900 focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
                <span className="text-slate-700 font-medium">Overnight SORA</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSeries.comp1m}
                  onChange={(e) =>
                    setActiveSeries({ ...activeSeries, comp1m: e.target.checked })
                  }
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                <span className="text-slate-700 font-medium">1M Compounded</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSeries.comp3m}
                  onChange={(e) =>
                    setActiveSeries({ ...activeSeries, comp3m: e.target.checked })
                  }
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-700 font-medium">3M Compounded (Mortgages)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSeries.comp6m}
                  onChange={(e) =>
                    setActiveSeries({ ...activeSeries, comp6m: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span className="text-slate-700 font-medium">6M Compounded</span>
              </label>
            </div>
          </div>

          {/* SVG Interactive Chart Canvas */}
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[360px] overflow-visible select-none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Horizontal Grid lines & Y-axis labels */}
              {gridTicks.map((val, idx) => {
                const y = getY(val);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono tabular-nums"
                    >
                      {val.toFixed(2)}%
                    </text>
                  </g>
                );
              })}

              {/* Data Series Paths */}
              {activeSeries.comp6m && (
                <path
                  d={path6M}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {activeSeries.comp3m && (
                <path
                  d={path3M}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {activeSeries.comp1m && (
                <path
                  d={path1M}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {activeSeries.overnight && (
                <path
                  d={pathOvernight}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              )}

              {/* Hover Inspection Line & Circles */}
              {hoveredIndex !== null && chartData[hoveredIndex] && (
                <g>
                  <line
                    x1={getX(hoveredIndex)}
                    y1={paddingTop}
                    x2={getX(hoveredIndex)}
                    y2={height - paddingBottom}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {activeSeries.overnight && (
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(chartData[hoveredIndex].overnightRate)}
                      r="4"
                      className="fill-slate-900 stroke-white stroke-2"
                    />
                  )}
                  {activeSeries.comp3m && (
                    <circle
                      cx={getX(hoveredIndex)}
                      cy={getY(chartData[hoveredIndex].compounded3M)}
                      r="4"
                      className="fill-amber-500 stroke-white stroke-2"
                    />
                  )}
                </g>
              )}

              {/* Invisible interactive vertical touch/hover columns */}
              {chartData.map((_, idx) => {
                const x = getX(idx);
                const step = chartW / Math.max(1, chartData.length - 1);
                return (
                  <rect
                    key={idx}
                    x={x - step / 2}
                    y={paddingTop}
                    width={step}
                    height={chartH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  />
                );
              })}

              {/* X-axis date labels */}
              {chartData.length > 0 && (
                <>
                  <text
                    x={paddingLeft}
                    y={height - 10}
                    textAnchor="start"
                    className="text-[11px] fill-slate-400 font-mono"
                  >
                    {chartData[0].date}
                  </text>
                  <text
                    x={paddingLeft + chartW / 2}
                    y={height - 10}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-400 font-mono"
                  >
                    {chartData[Math.floor(chartData.length / 2)].date}
                  </text>
                  <text
                    x={width - paddingRight}
                    y={height - 10}
                    textAnchor="end"
                    className="text-[11px] fill-slate-400 font-mono"
                  >
                    {chartData[chartData.length - 1].date}
                  </text>
                </>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredRecord && (
              <div
                className="absolute top-2 right-4 bg-slate-900/95 text-white p-3 rounded-md shadow-lg pointer-events-none text-xs space-y-1.5 backdrop-blur-xs border border-slate-700 font-mono"
              >
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                  MAS Date: {hoveredRecord.date}
                </div>
                <div className="flex justify-between gap-4 text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white inline-block" />
                    Overnight:
                  </span>
                  <span className="font-bold text-white">
                    {formatPercent(hoveredRecord.overnightRate, 4)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                    1M Comp.:
                  </span>
                  <span className="font-bold text-white">
                    {formatPercent(hoveredRecord.compounded1M, 4)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    3M Comp.:
                  </span>
                  <span className="font-bold text-white">
                    {formatPercent(hoveredRecord.compounded3M, 4)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    6M Comp.:
                  </span>
                  <span className="font-bold text-white">
                    {formatPercent(hoveredRecord.compounded6M, 4)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  Vol: S$ {(hoveredRecord.volumeMillion / 1000).toFixed(2)}B
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Raw Data Table View */
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by date (YYYY-MM)..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {searchedRecords.length} records
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Publication Date</th>
                  <th className="py-2.5 px-4 text-right">Overnight SORA</th>
                  <th className="py-2.5 px-4 text-right">1M Compounded</th>
                  <th className="py-2.5 px-4 text-right">3M Compounded</th>
                  <th className="py-2.5 px-4 text-right">6M Compounded</th>
                  <th className="py-2.5 px-4 text-right">Aggregate Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searchedRecords.map((r) => (
                  <tr key={r.date} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-4 font-mono font-medium text-slate-900">{r.date}</td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-700">{formatPercent(r.overnightRate, 4)}</td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-sky-700 font-medium">{formatPercent(r.compounded1M, 4)}</td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-amber-700 font-semibold">{formatPercent(r.compounded3M, 4)}</td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-emerald-700 font-medium">{formatPercent(r.compounded6M, 4)}</td>
                    <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-600">S$ {r.volumeMillion.toLocaleString()}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
