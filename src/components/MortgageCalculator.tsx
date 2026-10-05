import React, { useState } from 'react';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Info,
  DollarSign,
  Calendar,
  Percent,
} from 'lucide-react';
import { SoraSummary, SoraTenor } from '../types/sora';
import {
  calculateMortgage,
  formatCurrency,
  formatPercent,
  getTenorDetails,
} from '../utils/calculator';

interface MortgageCalculatorProps {
  summary: SoraSummary;
  selectedTenor: SoraTenor;
  onSelectTenor: (tenor: SoraTenor) => void;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  summary,
  selectedTenor,
  onSelectTenor,
}) => {
  // Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(800000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [bankSpread, setBankSpread] = useState<number>(0.65);
  const [customRateOverride, setCustomRateOverride] = useState<number | null>(null);
  const [isOverrideEnabled, setIsOverrideEnabled] = useState<boolean>(false);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  const tenorDetails = getTenorDetails(selectedTenor);

  const calculation = calculateMortgage(
    {
      loanAmount,
      tenureYears,
      tenor: selectedTenor,
      bankSpread,
      customRateOverride: isOverrideEnabled ? customRateOverride : null,
    },
    summary
  );

  const principalRatio = (loanAmount / calculation.totalPayment) * 100;
  const interestRatio = (calculation.totalInterest / calculation.totalPayment) * 100;

  const loanPresets = [
    { label: 'S$400k (HDB 4-Room)', val: 400000 },
    { label: 'S$800k (HDB EC / 5-Room)', val: 800000 },
    { label: 'S$1.2M (Private Condo)', val: 1200000 },
    { label: 'S$2.0M (Prime / Landed)', val: 2000000 },
  ];

  const spreadPresets = [0.55, 0.65, 0.75, 0.85, 1.00];

  const handleResetDefaults = () => {
    setLoanAmount(800000);
    setTenureYears(25);
    setBankSpread(0.65);
    setIsOverrideEnabled(false);
    setCustomRateOverride(null);
  };

  return (
    <section id="calculator" className="scroll-mt-20">
      <div className="mb-6 pb-3 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          SORA Mortgage &amp; Loan Calculator
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Compute monthly instalments, cumulative interest, MAS regulatory stress test figures, and minimum income requirements under TDSR.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          {/* Header Row with reset */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loan Parameters
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* 1. Loan Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="loan-amount-input" className="text-sm font-semibold text-slate-900">
                Loan Amount (SGD)
              </label>
              <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(loanAmount)}
              </div>
            </div>

            <div className="relative mb-3">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600">
                S$
              </span>
              <input
                id="loan-amount-input"
                type="number"
                min={50000}
                max={10000000}
                step={10000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(10000, Number(e.target.value) || 0))}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono tabular-nums text-slate-900"
              />
            </div>

            <input
              type="range"
              aria-label="Loan Amount Range Slider"
              min={100000}
              max={3000000}
              step={25000}
              value={Math.min(3000000, loanAmount)}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {loanPresets.map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => setLoanAmount(preset.val)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                    loanAmount === preset.val
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Loan Tenure */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tenure-input" className="text-sm font-semibold text-slate-900">
                Loan Tenure
              </label>
              <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                {tenureYears} Years ({tenureYears * 12} Months)
              </span>
            </div>

            <input
              id="tenure-input"
              type="range"
              min={5}
              max={35}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg mb-2"
            />

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>5 yrs</span>
              <span>25 yrs (HDB Max)</span>
              <span>30 yrs (Bank Max)</span>
              <span>35 yrs</span>
            </div>
          </div>

          {/* 3. SORA Tenor Selection */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Select SORA Tenor (Read from MAS)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'today' as SoraTenor, label: 'Today', sub: 'Overnight', rate: summary.today.rate },
                { id: '1m' as SoraTenor, label: 'Past Month', sub: '1M Comp.', rate: summary.pastMonth.rate },
                { id: '3m' as SoraTenor, label: 'Past 3 Months', sub: '3M Comp.', rate: summary.past3Months.rate },
                { id: '6m' as SoraTenor, label: 'Past 6 Months', sub: '6M Comp.', rate: summary.past6Months.rate },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTenor(t.id)}
                  className={`p-2.5 text-left rounded-md border transition-all ${
                    selectedTenor === t.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className={`text-xs font-semibold ${selectedTenor === t.id ? 'text-slate-200' : 'text-slate-500'}`}>
                    {t.label}
                  </div>
                  <div className={`text-xs ${selectedTenor === t.id ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t.sub}
                  </div>
                  <div className="text-sm font-mono font-bold mt-1 tabular-nums">
                    {formatPercent(t.rate, 4)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Bank Margin / Spread */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="bank-spread-input" className="text-sm font-semibold text-slate-900">
                Bank Spread / Margin (+%)
              </label>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                +{bankSpread.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  id="bank-spread-input"
                  type="number"
                  min={0.1}
                  max={4.0}
                  step={0.05}
                  value={bankSpread}
                  onChange={(e) => setBankSpread(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono tabular-nums"
                />
              </div>

              <div className="flex gap-1">
                {spreadPresets.map((val) => (
                  <button
                    key={val}
                    onClick={() => setBankSpread(val)}
                    className={`text-xs px-2.5 py-2 rounded font-mono transition-colors ${
                      bankSpread === val
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +{val.toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Singapore bank packages are typically structured as <strong>{tenorDetails.tenorName} + Bank Spread</strong>.
            </p>
          </div>

          {/* 5. Custom Rate Stress Simulation (Optional Override) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-700">
                Simulate Custom Hypothetical SORA Rate
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !isOverrideEnabled;
                  setIsOverrideEnabled(next);
                  if (next && customRateOverride === null) {
                    setCustomRateOverride(calculation.selectedSoraRate);
                  }
                }}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  isOverrideEnabled
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isOverrideEnabled ? 'Custom Rate Active' : 'Enable Simulation'}
              </button>
            </div>

            {isOverrideEnabled && (
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="custom-rate-input" className="text-xs font-semibold text-amber-900">
                    Hypothetical Benchmark SORA Rate (%):
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-900">
                    {(customRateOverride ?? calculation.selectedSoraRate).toFixed(4)}%
                  </span>
                </div>
                <input
                  id="custom-rate-input"
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.05}
                  value={customRateOverride ?? calculation.selectedSoraRate}
                  onChange={(e) => setCustomRateOverride(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-amber-700 mt-1">
                  <span>1.00%</span>
                  <span>3.50%</span>
                  <span>6.00%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Calculation Card */}
          <div className="bg-slate-900 text-white rounded-lg p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Monthly Repayment
            </div>
            
            <div className="flex items-baseline justify-between mb-4">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight">
                {formatCurrency(calculation.monthlyInstalment)}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                / month
              </div>
            </div>

            {/* Effective Rate Pill / Summary */}
            <div className="p-3 bg-slate-800/80 rounded-md border border-slate-700/80 mb-6">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Effective Interest Rate (p.a.)</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatPercent(calculation.effectiveRate, 4)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <span>{formatPercent(calculation.selectedSoraRate, 4)} SORA</span>
                <span>+</span>
                <span>{calculation.bankSpread.toFixed(2)}% Bank Margin</span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Loan Principal</span>
                <span className="font-mono font-medium text-white">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Interest (over {tenureYears} yrs)</span>
                <span className="font-mono font-medium text-white">
                  {formatCurrency(calculation.totalInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800">
                <span className="font-semibold text-white">Total Amount Repaid</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatCurrency(calculation.totalPayment)}
                </span>
              </div>
            </div>

            {/* Principal vs Interest Proportional Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Principal {principalRatio.toFixed(0)}%</span>
                <span>Interest {interestRatio.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${principalRatio}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Principal: ${formatCurrency(loanAmount)}`}
                />
                <div
                  style={{ width: `${interestRatio}%` }}
                  className="bg-amber-400 h-full"
                  title={`Interest: ${formatCurrency(calculation.totalInterest)}`}
                />
              </div>
            </div>
          </div>

          {/* MAS Regulatory Compliance & Stress Test Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                MAS Regulatory Safeguards
              </h3>
            </div>

            {/* MAS Stress Test */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>MAS Stress Test Rate (Notice 645)</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatPercent(calculation.stressTestRate, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Instalment under Stress Rate</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(calculation.stressMonthlyInstalment)}/mo
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Buffer against potential future interest rate increases (+{formatCurrency(calculation.stressMonthlyInstalment - calculation.monthlyInstalment)}/mo).
              </div>
            </div>

            {/* TDSR Income Requirement */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Min. Household Income (55% TDSR)</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(calculation.tdsrMinIncomeRequired)}/mo
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Under Monetary Authority of Singapore rules, your total debt obligations cannot exceed 55% of gross monthly income.
              </div>
            </div>

            {/* Amortization Schedule Toggle Button */}
            <button
              onClick={() => setShowAmortization(!showAmortization)}
              className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{showAmortization ? 'Hide Amortization Schedule' : 'View Yearly Amortization Schedule'}</span>
              {showAmortization ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Amortization Table */}
      {showAmortization && (
        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Yearly Amortization Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Estimated breakdown assuming the current benchmark rate of {formatPercent(calculation.effectiveRate, 4)} holds constant.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Tenure: {tenureYears} Years
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-200 rounded-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3 text-right">Opening Balance</th>
                  <th className="py-2.5 px-3 text-right">Principal Paid</th>
                  <th className="py-2.5 px-3 text-right">Interest Paid</th>
                  <th className="py-2.5 px-3 text-right">Total Annual Payment</th>
                  <th className="py-2.5 px-3 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calculation.amortization.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-900">Year {row.year}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">{formatCurrency(row.openingBalance)}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">{formatCurrency(row.principalPaid)}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-amber-700 font-medium">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-900 font-semibold">{formatCurrency(row.totalPaid)}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-800">{formatCurrency(row.closingBalance)}</td>
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
