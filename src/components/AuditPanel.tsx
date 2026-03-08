import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Loader2, X } from 'lucide-react';

interface Warning {
  type: 'a11y' | 'seo';
  message: string;
  element?: string;
}

interface AuditResult {
  a11yScore: number;
  seoScore: number;
  warnings: Warning[];
}

interface AuditPanelProps {
  onClose: () => void;
  currentHtml: string;
  onApplyFix: (fixedHtml: string) => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({ onClose, currentHtml, onApplyFix }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('https://sgfbackend.deejay.onl/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: currentHtml })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to audit');
      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert('Audit failed: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const runAutoFix = async () => {
    if (!result) return;
    setIsFixing(true);
    try {
      const res = await fetch('https://sgfbackend.deejay.onl/api/audit/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: currentHtml, warnings: result.warnings })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-fix');
      onApplyFix(data.html);
      setResult(null); // Clear results after fix
    } catch (err: any) {
      console.error(err);
      alert('Auto-fix failed: ' + err.message);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-black border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl">
      <div className="p-4 border-b border-hall-200 dark:border-hall-800 flex items-center justify-between bg-hall-50 dark:bg-hall-900/50">
        <h2 className="font-semibold text-hall-900 dark:text-ink flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          A11y & SEO Audit
        </h2>
        <button onClick={onClose} className="text-hall-500 hover:text-hall-900 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {!result && !isAuditing && (
          <div className="text-center py-10 flex flex-col items-center gap-4 text-hall-500 dark:text-hall-400">
            <ShieldAlert className="w-12 h-12 text-hall-300 dark:text-hall-700" />
            <p className="text-sm">Run an AI-powered audit to check for accessibility and SEO issues in your current page.</p>
            <button
              onClick={runAudit}
              className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Run Audit
            </button>
          </div>
        )}

        {isAuditing && (
          <div className="text-center py-10 flex flex-col items-center gap-4 text-hall-500 dark:text-hall-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm animate-pulse">Scanning DOM structure...</p>
          </div>
        )}

        {result && !isAuditing && (
          <>
            <div className="flex gap-4">
              <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex flex-col items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.a11yScore}</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-500 mt-1 uppercase tracking-wider">A11y Score</span>
              </div>
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-800/30">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.seoScore}</span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-500 mt-1 uppercase tracking-wider">SEO Score</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-hall-900 dark:text-ink flex items-center justify-between">
                Found Issues ({result.warnings.length})
                {result.warnings.length > 0 && (
                  <button
                    onClick={runAutoFix}
                    disabled={isFixing}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isFixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    Auto-Fix All
                  </button>
                )}
              </h3>
              
              {result.warnings.length === 0 ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                  Perfect! No issues found.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="p-3 bg-hall-50 dark:bg-hall-900/30 rounded-lg border border-hall-200 dark:border-hall-800 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${w.type === 'a11y' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'}`}>
                          {w.type}
                        </span>
                        <span className="font-medium text-hall-900 dark:text-ink">{w.message}</span>
                      </div>
                      {w.element && (
                        <code className="block mt-2 text-xs text-hall-500 dark:text-hall-400 bg-hall-100 dark:bg-black p-1.5 rounded overflow-x-auto whitespace-nowrap">
                          {w.element}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={runAudit}
              className="mt-4 w-full py-2 border border-hall-200 dark:border-hall-800 hover:bg-hall-50 dark:hover:bg-hall-900 text-hall-700 dark:text-hall-300 rounded-lg text-sm font-medium transition-colors"
            >
              Run Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};
