import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Layers, ShieldCheck, Scale } from 'lucide-react';

export const EducationalSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const guides = [
    {
      title: 'What is SORA and how does MAS publish it?',
      summary: 'Administered by the Monetary Authority of Singapore, SORA is the robust interest rate benchmark for SGD financial markets.',
      content: (
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            The <strong>Singapore Overnight Rate Average (SORA)</strong> is the volume-weighted average rate of unsecured overnight interbank SGD borrowing transactions in Singapore between 8:00am and 6:15pm SGT.
          </p>
          <p>
            MAS publishes SORA on each Singapore business day at <strong>9:00 AM SGT</strong> for the preceding business day. Unlike legacy SIBOR, which relied on indicative bank quotes, SORA is 100% grounded in actual settled transactions, making it virtually impossible to manipulate.
          </p>
        </div>
      ),
    },
    {
      title: 'How is Compounded SORA calculated (In Arrears)?',
      summary: 'Daily overnight rates compounded over 30, 90, or 180 calendar days using actual/365 convention.',
      content: (
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Compounded SORA rates are calculated based on the daily overnight SORA rates compounded daily over the specified observation period (in arrears):
          </p>
          <div className="p-2.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
            Compounded SORA = [ &prod;<sub>i=1</sub><sup>d<sub>0</sub></sup> (1 + (r<sub>i</sub> &times; n<sub>i</sub>) / 365) &minus; 1 ] &times; (365 / d) &times; 100%
          </div>
          <p>
            where <code>r<sub>i</sub></code> is the SORA rate on day <code>i</code>, <code>n<sub>i</sub></code> is the number of calendar days that rate applies for (accounting for weekends and public holidays), and <code>d</code> is the total number of calendar days in the observation window.
          </p>
        </div>
      ),
    },
    {
      title: '1M vs 3M vs 6M Compounded SORA: Which should you choose for a Singapore home loan?',
      summary: 'Comparing reset frequency, responsiveness, and monthly instalment predictability.',
      content: (
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="font-semibold text-slate-900 mb-1">1-Month SORA</div>
              <p>Resets 12 times a year. Best suited if interest rates are expected to decline rapidly, as your mortgage payments adjust downwards immediately.</p>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded">
              <div className="font-semibold text-amber-900 mb-1">3-Month SORA (Standard)</div>
              <p>Resets 4 times a year. The default mortgage package benchmark offered by DBS, OCBC, and UOB. Strikes an optimal balance between market sensitivity and stability.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="font-semibold text-slate-900 mb-1">6-Month SORA</div>
              <p>Resets twice a year. Offers maximum protection against rapid rate spikes, ensuring your monthly instalment stays fixed for 6 months at a time.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Singapore MAS Notice 645 & TDSR Regulatory Safeguards',
      summary: 'Understanding the 55% Total Debt Servicing Ratio cap and minimum stress test rates.',
      content: (
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            To prevent over-borrowing during periods of low interest rates, the Monetary Authority of Singapore mandates:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Total Debt Servicing Ratio (TDSR) 55%:</strong> The borrower's monthly total debt obligations (mortgage, car loans, credit cards, personal loans) cannot exceed 55% of their gross monthly income.
            </li>
            <li>
              <strong>Medium-Term Stress Test Rate:</strong> Banks must stress-test property loan affordability using a floor rate (currently 4.00% for residential property loans, or the prevailing rate + 1.00%, whichever is higher).
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <section id="mas-methodology" className="scroll-mt-20">
      <div className="mb-6 pb-3 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          MAS Methodology &amp; Home Loan Guide
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Everything you need to know about SORA calculation conventions and Singapore mortgage regulations.
        </p>
      </div>

      <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden">
        {guides.map((g, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full py-4 px-6 text-left flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{g.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{g.summary}</p>
                </div>
                <div className="pt-0.5 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 border-t border-slate-100 bg-slate-50/40">
                  {g.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
