/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SoraTenorSection } from './components/SoraTenorSection';
import { MortgageCalculator } from './components/MortgageCalculator';
import { TenorComparison } from './components/TenorComparison';
import { SoraRateChart } from './components/SoraRateChart';
import { EducationalSection } from './components/EducationalSection';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { SoraSummary, SoraTenor } from './types/sora';
import { fetchSoraRates, getStoredBackendUrl, saveStoredBackendUrl } from './services/masSoraService';
import { AlertCircle, RefreshCw, Sparkles, Building2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [summary, setSummary] = useState<SoraSummary | null>(null);
  const [selectedTenor, setSelectedTenor] = useState<SoraTenor>('3m');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>('');

  // Initial load
  const loadRates = useCallback(async (customUrl?: string) => {
    try {
      setError(null);
      const data = await fetchSoraRates(customUrl);
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load SORA rates:', err);
      setError(err.message || 'Failed to retrieve SORA rates');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredBackendUrl();
    setBackendUrl(stored);
    loadRates(stored);
  }, [loadRates]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRates(backendUrl);
  };

  const handleSaveBackendUrl = async (newUrl: string) => {
    saveStoredBackendUrl(newUrl);
    setBackendUrl(newUrl);
    setIsLoading(true);
    await loadRates(newUrl);
  };

  const handleTestBackend = async (testUrl: string): Promise<boolean> => {
    try {
      const res = await fetchSoraRates(testUrl);
      return res.dataSource === 'custom_backend';
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header adhering to 3-zone contract */}
      <Header
        summary={summary}
        isLoading={isRefreshing}
        onRefresh={handleRefresh}
        onOpenBackendConfig={() => setIsBackendModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {isLoading && !summary ? (
          /* Loading skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-slate-200 rounded-lg w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-44 bg-slate-200 rounded-lg" />
              <div className="h-44 bg-slate-200 rounded-lg" />
              <div className="h-44 bg-slate-200 rounded-lg" />
              <div className="h-44 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-96 bg-slate-200 rounded-lg" />
          </div>
        ) : summary ? (
          <>
            {/* 1. Core SORA Tenor Section: Today, Past Month, Past 3 Months, Past 6 Months */}
            <SoraTenorSection
              summary={summary}
              selectedTenor={selectedTenor}
              onSelectTenor={setSelectedTenor}
              onOpenBackendModal={() => setIsBackendModalOpen(true)}
            />

            {/* 2. Interactive SORA Mortgage & Loan Calculator */}
            <MortgageCalculator
              summary={summary}
              selectedTenor={selectedTenor}
              onSelectTenor={setSelectedTenor}
            />

            {/* 3. Side-by-Side Tenor Comparison Matrix */}
            <TenorComparison
              summary={summary}
              selectedTenor={selectedTenor}
              onSelectTenor={setSelectedTenor}
              loanAmount={800000}
              tenureYears={25}
              bankSpread={0.65}
            />

            {/* 4. Historical Trends & Interactive SVG Chart */}
            <SoraRateChart summary={summary} />

            {/* 5. Educational MAS Guide & Singapore Regulatory Context */}
            <EducationalSection />
          </>
        ) : (
          /* Error State */
          <div className="p-8 bg-white border border-rose-200 rounded-lg text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Unable to Load MAS Rates
            </h3>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => loadRates()}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}
      </main>

      {/* Backend Integration Drawer / Modal */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        currentBackendUrl={backendUrl}
        onSaveBackendUrl={handleSaveBackendUrl}
        dataSource={summary?.dataSource || 'mas_fallback'}
        statusMessage={summary?.statusMessage}
        onTestFetch={handleTestBackend}
      />

      {/* Minimalist Compliant Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">SORA SG Calculator</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Overnight Rate Average</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Rate data benchmarked against Monetary Authority of Singapore (MAS)</span>
            <span aria-hidden="true">·</span>
            <span>For financial planning &amp; estimation purposes only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
