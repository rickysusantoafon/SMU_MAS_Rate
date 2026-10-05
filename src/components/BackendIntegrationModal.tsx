import React, { useState } from 'react';
import { X, Check, Copy, AlertCircle, Database, CheckCircle2, ArrowUpRight, Terminal } from 'lucide-react';
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
  const [urlInput, setUrlInput] = useState(currentBackendUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
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

  const handleSave = () => {
    onSaveBackendUrl(urlInput);
    onClose();
  };

  const handleResetToBenchmark = () => {
    setUrlInput('');
    onSaveBackendUrl('');
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
                MAS Backend Rate Integration
              </h3>
              <p className="text-xs text-slate-500">
                Configure your server proxy to stream live MAS SORA rates into the calculator.
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
          {/* Current Status banner */}
          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-start gap-3">
            <div className="mt-0.5">
              {dataSource === 'custom_backend' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-sky-600" />
              )}
            </div>
            <div className="text-xs">
              <div className="font-semibold text-slate-900 mb-0.5">
                Current Status:{' '}
                {dataSource === 'custom_backend'
                  ? 'Connected to User Backend'
                  : dataSource === 'mas_api'
                  ? 'Connected to MAS Open Datastore'
                  : 'MAS Benchmark Mode Active'}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {statusMessage ||
                  'The frontend is fully built and ready to ingest live SORA rates from your server once you provide an endpoint.'}
              </p>
            </div>
          </div>

          {/* Endpoint Input */}
          <div className="space-y-2">
            <label htmlFor="backend-url-input" className="block text-xs font-semibold text-slate-900">
              Custom Backend Endpoint URL
            </label>
            <div className="flex gap-2">
              <input
                id="backend-url-input"
                type="text"
                placeholder="e.g. http://localhost:3001/api/sora or https://your-server.com/api/mas-sora"
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
                {testStatus === 'testing' ? 'Testing...' : 'Test URL'}
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Connection verified! SORA records parsed successfully.</span>
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

          {/* Why a backend proxy is required for MAS in browsers */}
          <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-md border border-slate-200/80 space-y-1">
            <div className="font-semibold text-slate-900">Why build a backend proxy for MAS?</div>
            <p>
              The official Monetary Authority of Singapore (MAS) Datastore API (<code>eservices.mas.gov.sg</code>) does not set permissive CORS headers for client-side web requests. Your backend acts as a proxy that fetches MAS SORA rates server-to-server and provides them to this frontend.
            </p>
          </div>

          {/* Sample Backend Implementations (Ready to Copy) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ready-to-Paste Backend Proxy Code
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
                  Node.js Express
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
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-md text-[11px] font-mono overflow-x-auto max-h-48">
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
            Reset to MAS Benchmark
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
