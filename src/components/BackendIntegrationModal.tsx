import React, { useState } from 'react';
import { X, Check, Copy, AlertCircle, Database, CheckCircle2, Terminal, Activity, Key } from 'lucide-react';
import { SAMPLE_BACKEND_EXPRESS_CODE, SAMPLE_BACKEND_PYTHON_CODE } from '../services/masSoraService';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackendUrl: string;
  onSaveBackendUrl: (url: string) => void;
  dataSource: 'mas_api' | 'custom_backend' | 'mas_fallback';
  statusMessage?: string;
  onTestFetch: (testUrl: string) => Promise<boolean>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  currentBackendUrl,
  onSaveBackendUrl,
  dataSource,
  statusMessage,
  onTestFetch,
}) => {
  const [urlInput, setUrlInput] = useState(currentBackendUrl || '/api/sora');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ checked: boolean; data?: any; error?: string }>({
    checked: false,
  });
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'express' | 'python'>('express');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestError(null);
    try {
      const ok = await onTestFetch(urlInput);
      if (ok) {
        setTestStatus('success');
      } else {
        setTestStatus('failed');
        setTestError('Backend reached but response could not be parsed as valid SORA payload.');
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestError(err.message || 'Network error or CORS policy blocked access to this URL.');
    }
  };

  const handleTestHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus({ checked: true, data });
    } catch (err: any) {
      setHealthStatus({ checked: true, error: err.message });
    }
  };

  const handleSave = () => {
    onSaveBackendUrl(urlInput);
    onClose();
  };

  const handleResetToBenchmark = () => {
    setUrlInput('/api/sora');
    onSaveBackendUrl('/api/sora');
    setTestStatus('idle');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-md">
              <Database className="w-4 h-4 text-slate-800" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                MAS Serverless Backend Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Serverless endpoints located in project root <code>/api</code> (<code>/api/sora.ts</code>, <code>/api/health.ts</code>).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status banner */}
          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-start gap-3">
            <div className="mt-0.5">
              {dataSource === 'custom_backend' || dataSource === 'mas_api' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-sky-600" />
              )}
            </div>
            <div className="text-xs">
              <div className="font-semibold text-slate-900 mb-0.5">
                Current Status:{' '}
                {dataSource === 'custom_backend'
                  ? 'Connected via Serverless /api/sora'
                  : dataSource === 'mas_api'
                  ? 'Connected to Live MAS APIMG Gateway'
                  : 'MAS Benchmark Mode Active'}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {statusMessage ||
                  'Serverless connection initialized at /api/sora. Set MAS_KEY_ID in .env to stream authenticated live rates from MAS.'}
              </p>
            </div>
          </div>

          {/* Active Serverless Endpoints Box */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Serverless Endpoints in /api
              </span>
              <button
                onClick={handleTestHealth}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <Activity className="w-3 h-3 text-emerald-600" />
                <span>Probe /api/health</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <div className="text-[11px] text-slate-500 font-sans">SORA Rates Feed</div>
                <div className="font-semibold text-slate-900">GET /api/sora</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">Pulls domestic interest rates daily</div>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <div className="text-[11px] text-slate-500 font-sans">Gateway Health</div>
                <div className="font-semibold text-slate-900">GET /api/health</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">Uptime &amp; KeyId detection</div>
              </div>
            </div>

            {healthStatus.checked && (
              <div className="p-2.5 bg-slate-900 text-slate-100 rounded text-xs font-mono">
                {healthStatus.error ? (
                  <div className="text-rose-400">Health Probe Error: {healthStatus.error}</div>
                ) : (
                  <div>
                    <span className="text-emerald-400">Health: OK</span> ·{' '}
                    <span>Uptime: {healthStatus.data?.uptimeSeconds}s</span> ·{' '}
                    <span className={healthStatus.data?.masKeyConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                      MAS_KEY_ID: {healthStatus.data?.masKeyConfigured ? 'Configured' : 'Not Set (Set in .env)'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MAS APIMG Gateway Specifications */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-500">
              MAS APIMG Gateway Specifications
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-md space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 font-sans">Target MAS Endpoint:</span>
                <div className="text-slate-900 break-all select-all font-semibold">
                  https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-sans">Required Header:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                  KeyId: &lt;MAS_KEY_ID&gt;
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-sans pt-1">
                Configure your API key by setting <code>MAS_KEY_ID=&quot;your_key_here&quot;</code> in your <code>.env</code> file. No keys are hardcoded in code.
              </div>
            </div>
          </div>

          {/* Endpoint Input */}
          <div className="space-y-2">
            <label htmlFor="backend-url-input" className="block text-xs font-semibold text-slate-900">
              Active SORA Endpoint (Default: <code>/api/sora</code>)
            </label>
            <div className="flex gap-2">
              <input
                id="backend-url-input"
                type="text"
                placeholder="/api/sora or http://localhost:3000/api/sora"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestStatus('idle');
                }}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing' || !urlInput.trim()}
                className="px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Endpoint'}
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Endpoint successfully connected and returned SORA records!</span>
              </div>
            )}

            {testStatus === 'failed' && (
              <div className="text-xs text-rose-600 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Connection test failed</span>
                </div>
                <div className="text-slate-500 pl-5">{testError}</div>
              </div>
            )}
          </div>

          {/* Sample Backend Implementations (Ready to Copy) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Serverless Implementation Reference
              </span>
              <div className="flex gap-1 text-xs">
                <button
                  onClick={() => setActiveCodeTab('express')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeCodeTab === 'express'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  TypeScript (/api/sora.ts)
                </button>
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeCodeTab === 'python'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Python FastAPI
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-md text-[11px] font-mono overflow-x-auto max-h-44">
                <code>
                  {activeCodeTab === 'express' ? SAMPLE_BACKEND_EXPRESS_CODE : SAMPLE_BACKEND_PYTHON_CODE}
                </code>
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeCodeTab === 'express' ? SAMPLE_BACKEND_EXPRESS_CODE : SAMPLE_BACKEND_PYTHON_CODE,
                    activeCodeTab
                  )
                }
                className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs inline-flex items-center gap-1 transition-colors"
                title="Copy code"
              >
                {copiedSnippet === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleResetToBenchmark}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Reset to /api/sora Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
