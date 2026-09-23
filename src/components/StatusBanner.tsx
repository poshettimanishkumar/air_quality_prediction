import React, { useEffect, useState } from 'react';
import { checkBackendHealth, checkBackendRoot, API_BASE_URL } from '../services/api';
import { isFirebaseConfigured } from '../services/firebase';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export const StatusBanner: React.FC = () => {
  const [backendAlive, setBackendAlive] = useState<boolean | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(false);

  const performCheck = async () => {
    setChecking(true);
    const [rootRes, healthRes] = await Promise.all([
      checkBackendRoot(),
      checkBackendHealth()
    ]);
    setBackendAlive(rootRes.success);
    setModelLoaded(healthRes.healthy);
    setChecking(false);
  };

  useEffect(() => {
    performCheck();
  }, []);

  if (minimized) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-4 flex justify-between items-center text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>System Status: FastAPI Backend ({backendAlive ? 'Online' : 'Checking...'})</span>
        </div>
        <button
          onClick={() => setMinimized(false)}
          className="text-slate-300 hover:text-white underline text-[11px]"
        >
          Show Details
        </button>
      </div>
    );
  }

  return (
    <div id="system-status-banner" className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Backend Diagnostics:
          </span>

          {/* FastAPI Server Status */}
          <span className="inline-flex items-center gap-1">
            {backendAlive === null ? (
              <span className="text-slate-400">Connecting to Render...</span>
            ) : backendAlive ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> FastAPI Live
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Render Waking Up (Cold Start)
              </span>
            )}
          </span>

          <span className="text-slate-600">|</span>

          {/* Model Status */}
          <span className="inline-flex items-center gap-1">
            {modelLoaded === null ? (
              <span className="text-slate-400">Inspecting /health...</span>
            ) : modelLoaded ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> XGBoost Model Loaded
              </span>
            ) : (
              <span className="text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Model file unmounted on Render (/health: false)
              </span>
            )}
          </span>

          <span className="text-slate-600">|</span>

          {/* Firebase Status */}
          <span className="inline-flex items-center gap-1">
            {isFirebaseConfigured ? (
              <span className="text-emerald-400">Firebase Cloud Active</span>
            ) : (
              <span className="text-sky-300">Firebase Environment Mode (Client Ready)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="refresh-backend-status-btn"
            onClick={performCheck}
            disabled={checking}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check Status'}</span>
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="text-slate-700 hover:text-slate-300 text-[11px] ml-1"
            title="Minimize"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
