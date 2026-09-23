import React from 'react';
import { PredictionInput, PredictionSuccessResponse } from '../types';
import { Sparkles, ArrowLeft, History, LayoutDashboard, CheckCircle2, ShieldCheck, MapPin, Calendar, Activity } from 'lucide-react';

interface PredictResultProps {
  input: PredictionInput | null;
  output: PredictionSuccessResponse | null;
  setCurrentTab: (tab: string) => void;
}

export const PredictResult: React.FC<PredictResultProps> = ({ input, output, setCurrentTab }) => {
  if (!output || !input) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-600 mb-4">No active prediction result available in current session.</p>
          <button
            id="result-back-to-predict-btn"
            onClick={() => setCurrentTab('predict')}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
          >
            Go to Prediction Form
          </button>
        </div>
      </div>
    );
  }

  // Calculate descriptive air quality category for user context (based on standard PM2.5 / CPCB scale)
  const getQualityBadge = (val: number, pollutant: string) => {
    if (pollutant.toUpperCase().includes('PM2.5')) {
      if (val <= 30) return { label: 'Good', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      if (val <= 60) return { label: 'Satisfactory', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      if (val <= 90) return { label: 'Moderate', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      if (val <= 120) return { label: 'Poor', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      return { label: 'Severe', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    return { label: 'Estimated Index', color: 'bg-slate-100 text-slate-800 border-slate-300' };
  };

  const badge = getQualityBadge(output.predicted_pollutant_avg, input.pollutant_id);

  return (
    <div id="prediction-result-page" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>FastAPI Inference Complete</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Prediction Result
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {output.message}
          </p>
        </div>

        {/* Primary Result Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
            Predicted Pollutant Average
          </span>

          <div className="my-3 flex items-baseline justify-center gap-2">
            <span
              id="predicted-pollutant-avg-display"
              className="text-6xl sm:text-7xl font-extrabold text-slate-900 tracking-tight font-mono"
            >
              {typeof output.predicted_pollutant_avg === 'number'
                ? output.predicted_pollutant_avg.toFixed(2)
                : output.predicted_pollutant_avg}
            </span>
            <span className="text-slate-700 font-semibold text-lg">µg/m³</span>
          </div>

          <div className="flex items-center justify-center gap-3 my-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-slate-700">Target Pollutant: <strong className="text-slate-800">{input.pollutant_id}</strong></span>
          </div>

          {/* Model & Target Metadata */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-[11px] font-semibold text-slate-700 uppercase">Model</span>
              <span className="text-sm font-bold text-slate-900">{output.model}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-[11px] font-semibold text-slate-700 uppercase">Target</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">{output.target}</span>
            </div>
          </div>
        </div>

        {/* Submitted Input Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Submitted Station Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">Country:</span>
              <span className="font-semibold text-slate-900">{input.country}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">State:</span>
              <span className="font-semibold text-slate-900">{input.state}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">City:</span>
              <span className="font-semibold text-slate-900">{input.city}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">Station Name:</span>
              <span className="font-semibold text-slate-900">{input.station}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">Coordinates:</span>
              <span className="font-mono text-xs font-semibold text-slate-900">
                {input.latitude}, {input.longitude}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">Pollutant ID:</span>
              <span className="font-semibold text-emerald-700 font-mono">{input.pollutant_id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 sm:col-span-2">
              <span className="text-slate-700">Observation Timestamp (last_update):</span>
              <span className="font-mono text-xs font-semibold text-slate-900">{input.last_update}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="result-predict-again-btn"
            onClick={() => setCurrentTab('predict')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Predict Again</span>
          </button>

          <button
            id="result-history-btn"
            onClick={() => setCurrentTab('history')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all"
          >
            <History className="w-4 h-4" />
            <span>View Prediction History</span>
          </button>

          <button
            id="result-dashboard-btn"
            onClick={() => setCurrentTab('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
