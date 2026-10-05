export type SoraTenor = 'today' | '1m' | '3m' | '6m';

export interface SoraRecord {
  date: string; // YYYY-MM-DD
  overnightRate: number; // e.g. 3.2100
  compounded1M: number; // e.g. 3.2450
  compounded3M: number; // e.g. 3.2820
  compounded6M: number; // e.g. 3.3150
  volumeMillion: number; // SGD Million e.g. 3850
  publishedAt: string;
  source?: string;
}

export interface TenorStats {
  rate: number;
  prevRate: number;
  deltaBps: number;
  min: number;
  max: number;
  avg: number;
  periodLabel: string;
  description: string;
}

export interface SoraSummary {
  today: {
    rate: number;
    prevRate: number;
    deltaBps: number;
    volumeMillion: number;
    date: string;
    calculationPeriod: string;
    description: string;
  };
  pastMonth: TenorStats;
  past3Months: TenorStats;
  past6Months: TenorStats;
  history: SoraRecord[];
  lastUpdated: string;
  dataSource: 'mas_api' | 'custom_backend' | 'mas_fallback';
  endpointUsed?: string;
  statusMessage?: string;
}

export interface MortgageCalculationParams {
  loanAmount: number;
  tenureYears: number;
  tenor: SoraTenor;
  bankSpread: number;
  customRateOverride?: number | null;
}

export interface AmortizationRow {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  closingBalance: number;
}

export interface TenorComparisonItem {
  tenor: SoraTenor;
  label: string;
  tenorName: string;
  soraRate: number;
  bankSpread: number;
  effectiveRate: number;
  monthlyInstalment: number;
  totalInterest: number;
  totalPayment: number;
  diffMonthlyVsSelected: number;
  diffTotalVsSelected: number;
  resetCadence: string;
  suitability: string;
}

export interface MortgageCalculationResult {
  selectedSoraRate: number;
  bankSpread: number;
  effectiveRate: number;
  monthlyInstalment: number;
  totalPayment: number;
  totalInterest: number;
  stressTestRate: number;
  stressMonthlyInstalment: number;
  tdsrMinIncomeRequired: number; // 55% Total Debt Servicing Ratio threshold
  amortization: AmortizationRow[];
  comparisons: TenorComparisonItem[];
}
