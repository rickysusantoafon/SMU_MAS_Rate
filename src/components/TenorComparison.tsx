import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SoraSummary, SoraTenor } from '../types/sora';
import { calculateMortgage, formatCurrency, formatPercent } from '../utils/calculator';

interface TenorComparisonProps {
  summary: SoraSummary;
  selectedTenor: SoraTenor;
  onSelectTenor: (tenor: SoraTenor) => void;
  loanAmount: number;
  tenureYears: number;
  bankSpread: number;
}

export const TenorComparison: React.FC<TenorComparisonProps> = ({
  summary,
  selectedTenor,
  onSelectTenor,
  loanAmount = 800000,
  tenureYears = 25,
  bankSpread = 0.65,
}) => {
  const calcResult = calculateMortgage(
    {
      loanAmount,
      tenureYears,
      tenor: selectedTenor,
      bankSpread,
    },
    summary
  );

  return (
    <section id="tenor-comparison" className="scroll-mt-20">
      <div className="mb-6 pb-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Tenor Comparison Matrix
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Side-by-side comparison across all SORA tenors for a {formatCurrency(loanAmount)} loan over {tenureYears} years with +{bankSpread.toFixed(2)}% margin.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Updated via MAS feed
          </span>
        </div>
      </div>

      {/* Comparison Grid / Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tenor &amp; Benchmark</th>
                <th className="py-3 px-4 text-right">MAS Rate</th>
                <th className="py-3 px-4 text-right">Effective Rate</th>
                <th className="py-3 px-4 text-right">Monthly Instalment</th>
                <th className="py-3 px-4 text-right">Total Interest</th>
                <th className="py-3 px-4">Reset Cadence</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calcResult.comparisons.map((item) => {
                const isSelected = selectedTenor === item.tenor;

                return (
                  <tr
                    key={item.tenor}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-slate-50/90 font-medium'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Tenor column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{item.label}</span>
                            {item.tenor === '3m' && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50">
                                SG Bank Standard
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.tenorName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MAS SORA Rate */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 font-semibold text-sm">
                      {formatPercent(item.soraRate, 4)}
                    </td>

                    {/* Effective Rate */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 font-medium text-sm">
                      {formatPercent(item.effectiveRate, 4)}
                    </td>

                    {/* Monthly Instalment */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 font-bold text-sm">
                      {formatCurrency(item.monthlyInstalment)}
                      {item.diffMonthlyVsSelected !== 0 && (
                        <div
                          className={`text-[10px] font-mono ${
                            item.diffMonthlyVsSelected > 0
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {item.diffMonthlyVsSelected > 0 ? '+' : ''}
                          {formatCurrency(item.diffMonthlyVsSelected)}/mo
                        </div>
                      )}
                    </td>

                    {/* Total Interest */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {formatCurrency(item.totalInterest)}
                      {item.diffTotalVsSelected !== 0 && (
                        <div
                          className={`text-[10px] font-mono ${
                            item.diffTotalVsSelected > 0
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {item.diffTotalVsSelected > 0 ? '+' : ''}
                          {formatCurrency(item.diffTotalVsSelected)}
                        </div>
                      )}
                    </td>

                    {/* Reset Cadence & Suitability */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">{item.resetCadence}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs">{item.suitability}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectTenor(item.tenor)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
