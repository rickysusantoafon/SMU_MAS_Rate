# SORA Singapore Rate & Mortgage Calculator

A modern, responsive Singapore Overnight Rate Average (SORA) calculator and rate tracker designed to read Monetary Authority of Singapore (MAS) benchmarks and simulate residential home loans.

## Features

- **MAS Benchmark Rate Tenors**:
  - **Today (Overnight SORA)**: Volume-weighted interbank rate (08:00–18:15 SGT window) published at 9:00 AM SGT by MAS, with basis points delta ($\Delta$ bps) and daily unsecured volume.
  - **Past Month (1-Month Compounded SORA)**: Compounded average in arrears over the preceding 30 days with 30-day min/max range.
  - **Past 3 Months (3-Month Compounded SORA)**: Standard benchmark used by major Singapore lenders (DBS, OCBC, UOB) for residential floating home loans.
  - **Past 6 Months (6-Month Compounded SORA)**: Smoothed 180-day benchmark offering maximum stability against short-term interest rate volatility.
- **Mortgage & Home Loan Calculator**:
  - Loan amounts (with presets for HDB 4-room, Executive Condos, Private Condos, and Landed property).
  - Tenure adjustment from 5 to 35 years.
  - Bank margin spread (+0.55% to +1.00% presets or custom).
  - Total repayment, monthly instalment, and principal vs interest visual ratio.
  - MAS Notice 645 Regulatory Stress Test (4.00% benchmark floor).
  - MAS Total Debt Servicing Ratio (TDSR 55%) minimum monthly income check.
  - Yearly amortization schedule table.
- **Tenor Comparison Matrix**:
  - Side-by-side comparison across all four tenors showing monthly instalment differences and lifetime interest costs.
- **Historical Chart & Explorer**:
  - Interactive SVG trajectory chart across 1M, 3M, 6M, and 180-day periods.
  - Raw MAS publication records table with date search and one-click CSV export.
- **MAS Backend Integration Ready**:
  - Built-in adapter to connect to your own custom backend proxy (e.g. `http://localhost:3001/api/sora`) to stream live MAS data and bypass browser CORS limits.
  - Includes sample Express (Node.js) and FastAPI (Python) proxy snippets.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build

```bash
npm run build
```
