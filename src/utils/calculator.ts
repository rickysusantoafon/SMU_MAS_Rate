import { MortgageCalculationParams, MortgageCalculationResult, SoraSummary, SoraTenor, TenorComparisonItem, AmortizationRow } from '../types/sora';

export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPercent(val: number, decimals: number = 4): string {
  return `${val.toFixed(decimals)}%`;
}

export function formatBps(bps: number): string {
  const sign = bps > 0 ? '+' : '';
  return `${sign}${bps.toFixed(1)} bps`;
}

export function calculateMonthlyPayment(principal: number, annualRatePct: number, tenureYears: number): number {
  if (annualRatePct <= 0) return principal / (tenureYears * 12);
  const monthlyRate = annualRatePct / 100 / 12;
  const numPayments = tenureYears * 12;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function calculateAmortizationSchedule(principal: number, annualRatePct: number, tenureYears: number): AmortizationRow[] {
  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = tenureYears * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRatePct, tenureYears);
  
  let balance = principal;
  const rows: AmortizationRow[] = [];

  for (let year = 1; year <= tenureYears; year++) {
    const openingBalance = balance;
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = Math.min(balance, monthlyPayment - interestForMonth);
      yearInterest += interestForMonth;
      yearPrincipal += principalForMonth;
      balance -= principalForMonth;
    }

    rows.push({
      year,
      openingBalance,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      totalPaid: Math.round(yearPrincipal + yearInterest),
      closingBalance: Math.max(0, Math.round(balance)),
    });
  }

  return rows;
}

export function getRateForTenor(tenor: SoraTenor, summary: SoraSummary): number {
  switch (tenor) {
    case 'today':
      return summary.today.rate;
    case '1m':
      return summary.pastMonth.rate;
    case '3m':
      return summary.past3Months.rate;
    case '6m':
      return summary.past6Months.rate;
  }
}

export function getTenorDetails(tenor: SoraTenor): { label: string; tenorName: string; resetCadence: string; suitability: string } {
  switch (tenor) {
    case 'today':
      return {
        label: 'Today',
        tenorName: 'Overnight SORA',
        resetCadence: 'Daily reset',
        suitability: 'Direct benchmark tracking daily interbank SGD rate',
      };
    case '1m':
      return {
        label: 'Past Month',
        tenorName: '1-Month Compounded SORA',
        resetCadence: 'Monthly reset (12x/year)',
        suitability: 'Fastest responsiveness to falling rate environments',
      };
    case '3m':
      return {
        label: 'Past 3 Months',
        tenorName: '3-Month Compounded SORA',
        resetCadence: 'Quarterly reset (4x/year)',
        suitability: 'Standard benchmark used by DBS, OCBC, and UOB for home loans',
      };
    case '6m':
      return {
        label: 'Past 6 Months',
        tenorName: '6-Month Compounded SORA',
        resetCadence: 'Semi-annual reset (2x/year)',
        suitability: 'Highest payment stability with smoothed volatility',
      };
  }
}

export function calculateMortgage(
  params: MortgageCalculationParams,
  summary: SoraSummary
): MortgageCalculationResult {
  const { loanAmount, tenureYears, tenor, bankSpread, customRateOverride } = params;
  
  const selectedSoraRate = customRateOverride !== null && customRateOverride !== undefined
    ? customRateOverride
    : getRateForTenor(tenor, summary);

  const effectiveRate = Number((selectedSoraRate + bankSpread).toFixed(4));
  const monthlyInstalment = calculateMonthlyPayment(loanAmount, effectiveRate, tenureYears);
  const totalMonths = tenureYears * 12;
  const totalPayment = monthlyInstalment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  // MAS Notice 645 Regulatory Stress Test Rate:
  // MAS benchmark for residential property loans is minimum 4.00% or effective rate + 1.00%, whichever is higher
  const stressTestRate = Math.max(4.0, Number((effectiveRate + 1.0).toFixed(2)));
  const stressMonthlyInstalment = calculateMonthlyPayment(loanAmount, stressTestRate, tenureYears);

  // MAS TDSR (Total Debt Servicing Ratio) cap is 55% of borrower monthly income
  const tdsrMinIncomeRequired = stressMonthlyInstalment / 0.55;

  const amortization = calculateAmortizationSchedule(loanAmount, effectiveRate, tenureYears);

  // Calculate comparisons across all 4 tenors
  const tenors: SoraTenor[] = ['today', '1m', '3m', '6m'];
  const comparisons: TenorComparisonItem[] = tenors.map((t) => {
    const soraRate = getRateForTenor(t, summary);
    const eff = Number((soraRate + bankSpread).toFixed(4));
    const monthly = calculateMonthlyPayment(loanAmount, eff, tenureYears);
    const totPay = monthly * totalMonths;
    const totInt = totPay - loanAmount;
    const details = getTenorDetails(t);

    return {
      tenor: t,
      label: details.label,
      tenorName: details.tenorName,
      soraRate,
      bankSpread,
      effectiveRate: eff,
      monthlyInstalment: Math.round(monthly),
      totalInterest: Math.round(totInt),
      totalPayment: Math.round(totPay),
      diffMonthlyVsSelected: Math.round(monthly - monthlyInstalment),
      diffTotalVsSelected: Math.round(totInt - totalInterest),
      resetCadence: details.resetCadence,
      suitability: details.suitability,
    };
  });

  return {
    selectedSoraRate,
    bankSpread,
    effectiveRate,
    monthlyInstalment: Math.round(monthlyInstalment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    stressTestRate,
    stressMonthlyInstalment: Math.round(stressMonthlyInstalment),
    tdsrMinIncomeRequired: Math.round(tdsrMinIncomeRequired),
    amortization,
    comparisons,
  };
}
