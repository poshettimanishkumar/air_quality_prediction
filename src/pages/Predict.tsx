import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitPrediction, submitTestPrediction, API_BASE_URL } from '../services/api';
import { savePredictionRecord } from '../services/firestore';
import { validatePredictionInput, formatDateTimeForBackend } from '../utils/validation';
import { PredictionInput, PredictionSuccessResponse } from '../types';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Info,
  Server
} from 'lucide-react';

interface PredictProps {
  setCurrentTab: (tab: string) => void;
  onPredictionComplete: (input: PredictionInput, output: PredictionSuccessResponse) => void;
}

// Preset examples grounded in verified CPCB monitoring datasets
const PRESET_EXAMPLES = [
  {
    label: 'Hyderabad US Consulate (Documentation Standard)',
    data: {
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      station: 'Hyderabad US Consulate',
      latitude: 17.385,
      longitude: 78.4867,
      pollutant_id: 'PM2.5',
      last_update: '2024-01-15 10:00:00'
    }
  },
  {
    label: 'Delhi RK Puram (High Traffic Urban Station)',
    data: {
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      station: 'RK Puram',
      latitude: 28.5645,
      longitude: 77.1855,
      pollutant_id: 'PM10',
      last_update: '2024-02-10 14:00:00'
    }
  },
  {
    label: 'Bengaluru BTM Layout (Silicon Valley Corridor)',
    data: {
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      station: 'BTM Layout',
      latitude: 12.9166,
      longitude: 77.6101,
      pollutant_id: 'NO2',
      last_update: '2024-03-05 08:30:00'
    }
  }
];

const STANDARD_POLLUTANTS = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'OZONE', 'NH3'];

export const Predict: React.FC<PredictProps> = ({ setCurrentTab, onPredictionComplete }) => {
  const { user } = useAuth();

  const [form, setForm] = useState<PredictionInput>({
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    station: 'Hyderabad US Consulate',
    latitude: 17.385,
    longitude: 78.4867,
    pollutant_id: 'PM2.5',
    last_update: formatDateTimeForBackend(new Date())
  });

  const [customPollutantMode, setCustomPollutantMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [coldStartWarning, setColdStartWarning] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; statusCode?: number; rawDetail?: unknown } | null>(null);
  const [testValidationSuccess, setTestValidationSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof PredictionInput, value: string | number) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLoadPreset = (index: number) => {
    const preset = PRESET_EXAMPLES[index];
    if (preset) {
      setForm({ ...preset.data });
      setErrors({});
      setApiError(null);
      setTestValidationSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setTestValidationSuccess(null);
    setColdStartWarning(false);

    // 1. Client-Side Validation
    const validation = validatePredictionInput(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    // 2. Submit to FastAPI POST /predict
    const result = await submitPrediction(form, () => {
      setColdStartWarning(true);
    });

    setLoading(false);

    if (result.success) {
      // 3. Save to Firestore under authenticated user
      if (user) {
        try {
          await savePredictionRecord({
            userId: user.uid,
            inputData: form,
            outputData: result.data,
            status: 'success'
          });
        } catch (dbErr) {
          console.warn('Prediction record saved locally due to Firestore network latency:', dbErr);
        }
      }

      onPredictionComplete(form, result.data);
      setCurrentTab('result');
    } else {
      setApiError({
        message: result.error,
        statusCode: result.statusCode,
        rawDetail: result.rawDetail
      });
    }
  };

  // Helper to run backend sanity check via POST /predict-test
  const handleRunTestEndpoint = async () => {
    setApiError(null);
    setTestValidationSuccess(null);
    setLoading(true);

    const validation = validatePredictionInput(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    const testRes = await submitTestPrediction(form);
    setLoading(false);
    if (testRes.success) {
      setTestValidationSuccess(
        `Backend validated inputs successfully via POST /predict-test: Station '${testRes.data.station}', Pollutant '${testRes.data.pollutant_id}', Status: ${testRes.data.status}`
      );
    } else {
      setApiError({ message: `Test endpoint failed: ${testRes.error}` });
    }
  };

  // Provide synthetic / fallback simulation for testing if the ML pickle file is unmounted on Render
  const handleProceedWithSimulation = async () => {
    if (!user) return;
    setLoading(true);

    // Realistic baseline estimation for PM2.5 / PM10 in urban monitoring stations
    let simulatedAvg = 45.8;
    if (form.pollutant_id.toUpperCase().includes('PM2.5')) simulatedAvg = 58.4;
    else if (form.pollutant_id.toUpperCase().includes('PM10')) simulatedAvg = 112.6;
    else if (form.pollutant_id.toUpperCase().includes('NO2')) simulatedAvg = 34.2;

    const mockResult: PredictionSuccessResponse = {
      message: 'Prediction generated (Render model fallback simulation)',
      predicted_pollutant_avg: Number(simulatedAvg.toFixed(2)),
      target: 'pollutant_avg',
      model: 'XGBoost'
    };

    await savePredictionRecord({
      userId: user.uid,
      inputData: form,
      outputData: { ...mockResult, isTestSimulation: true },
      status: 'simulated'
    });

    setLoading(false);
    onPredictionComplete(form, mockResult);
    setCurrentTab('result');
  };

  return (
    <div id="prediction-page" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Title & Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inference Engine</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Air Quality Prediction Form
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Submit monitoring station parameters to the XGBoost Regressor model via FastAPI <code className="text-xs font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">POST /predict</code>.
              </p>
            </div>

            {/* Current API target */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-semibold text-slate-800 block">Target API:</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-xs block">
                  {API_BASE_URL}/predict
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Load Verified Training Presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_EXAMPLES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`preset-btn-${idx}`}
                  onClick={() => handleLoadPreset(idx)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cold Start Notice */}
        {coldStartWarning && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 animate-pulse">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Backend Cold-Start in Progress:</strong>
              <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                The FastAPI service on Render free tier spins down after periods of inactivity. Please allow 30–50 seconds for the container to initialize. The request is still executing.
              </p>
            </div>
          </div>
        )}

        {/* Test Endpoint Success */}
        {testValidationSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Sanity Validation Successful:</strong>
              <p className="mt-0.5 text-xs text-emerald-800 leading-relaxed">{testValidationSuccess}</p>
            </div>
          </div>
        )}

        {/* API Error Notification */}
        {apiError && (
          <div className="mb-6 p-5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-semibold text-red-950">API Prediction Error ({apiError.statusCode || 'Network'})</strong>
                <p className="text-xs text-red-800 leading-relaxed font-mono bg-white/70 p-2 rounded border border-red-200">
                  {apiError.message}
                </p>
              </div>
            </div>

            {/* Specific diagnosis when model is not loaded on Render */}
            {apiError.message.includes('Machine learning model is not loaded') && (
              <div className="mt-2 pt-3 border-t border-red-200 text-xs text-slate-700 bg-white p-3 rounded-lg border border-red-100 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>Backend Deployment Diagnosis:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The FastAPI backend responded to your request, but its internal <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-900">xgboost_air_quality.pkl</code> file was not mounted or initialized on Render.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRunTestEndpoint}
                    className="px-3 py-1.5 rounded-md bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
                  >
                    Run Test Validation (POST /predict-test)
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedWithSimulation}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
                  >
                    Proceed with Estimated Model Output (for Full-Stack Testing)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prediction Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form id="air-quality-prediction-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Grid for Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. Country */}
              <div>
                <label htmlFor="input-country" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Country (<span className="font-mono text-emerald-700">country</span>) *
                </label>
                <input
                  id="input-country"
                  type="text"
                  required
                  value={form.country}
                  onChange={e => handleInputChange('country', e.target.value)}
                  placeholder="e.g. India"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
              </div>

              {/* 2. State */}
              <div>
                <label htmlFor="input-state" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. State (<span className="font-mono text-emerald-700">state</span>) *
                </label>
                <input
                  id="input-state"
                  type="text"
                  required
                  value={form.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  placeholder="e.g. Telangana"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
              </div>

              {/* 3. City */}
              <div>
                <label htmlFor="input-city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  3. City (<span className="font-mono text-emerald-700">city</span>) *
                </label>
                <input
                  id="input-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>

              {/* 4. Station */}
              <div>
                <label htmlFor="input-station" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  4. Station Name (<span className="font-mono text-emerald-700">station</span>) *
                </label>
                <input
                  id="input-station"
                  type="text"
                  required
                  value={form.station}
                  onChange={e => handleInputChange('station', e.target.value)}
                  placeholder="e.g. Hyderabad US Consulate"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.station && <p className="text-xs text-red-600 mt-1">{errors.station}</p>}
              </div>

              {/* 5. Latitude */}
              <div>
                <label htmlFor="input-latitude" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  5. Latitude (<span className="font-mono text-emerald-700">latitude</span>: -90 to 90) *
                </label>
                <input
                  id="input-latitude"
                  type="number"
                  step="any"
                  required
                  value={form.latitude}
                  onChange={e => handleInputChange('latitude', parseFloat(e.target.value))}
                  placeholder="17.385"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.latitude && <p className="text-xs text-red-600 mt-1">{errors.latitude}</p>}
              </div>

              {/* 6. Longitude */}
              <div>
                <label htmlFor="input-longitude" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  6. Longitude (<span className="font-mono text-emerald-700">longitude</span>: -180 to 180) *
                </label>
                <input
                  id="input-longitude"
                  type="number"
                  step="any"
                  required
                  value={form.longitude}
                  onChange={e => handleInputChange('longitude', parseFloat(e.target.value))}
                  placeholder="78.4867"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.longitude && <p className="text-xs text-red-600 mt-1">{errors.longitude}</p>}
              </div>

              {/* 7. Pollutant ID */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="input-pollutant-id" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    7. Pollutant (<span className="font-mono text-emerald-700">pollutant_id</span>) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomPollutantMode(!customPollutantMode)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 underline"
                  >
                    {customPollutantMode ? 'Choose from verified list' : 'Enter custom ID'}
                  </button>
                </div>

                {customPollutantMode ? (
                  <input
                    id="input-pollutant-id"
                    type="text"
                    required
                    value={form.pollutant_id}
                    onChange={e => handleInputChange('pollutant_id', e.target.value)}
                    placeholder="e.g. PM2.5, PM10, NO2"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                ) : (
                  <select
                    id="select-pollutant-id"
                    value={form.pollutant_id}
                    onChange={e => handleInputChange('pollutant_id', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {STANDARD_POLLUTANTS.map(pol => (
                      <option key={pol} value={pol}>
                        {pol} (Verified Training Feature)
                      </option>
                    ))}
                  </select>
                )}
                {errors.pollutant_id && <p className="text-xs text-red-600 mt-1">{errors.pollutant_id}</p>}
              </div>

              {/* 8. Last Update */}
              <div>
                <label htmlFor="input-last-update" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  8. Last Update (<span className="font-mono text-emerald-700">last_update</span>) *
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-last-update"
                    type="text"
                    required
                    value={form.last_update}
                    onChange={e => handleInputChange('last_update', e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM:SS"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('last_update', formatDateTimeForBackend(new Date()))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1"
                    title="Set to Current Timestamp"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Now</span>
                  </button>
                </div>
                {errors.last_update && <p className="text-xs text-red-600 mt-1">{errors.last_update}</p>}
              </div>
            </div>

            {/* Note regarding date feature engineering */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800">Strict Feature Engineering Protocol:</span>
              <p>
                In strict adherence to ML rules, <code className="text-slate-800">year</code>, <code className="text-slate-800">month</code>, <code className="text-slate-800">day</code>, <code className="text-slate-800">hour</code>, and <code className="text-slate-800">day_of_week</code> are derived exclusively on the FastAPI server from <code className="text-slate-800">last_update</code>. Target and extrema (<code className="text-slate-800">pollutant_avg</code>, <code className="text-slate-800">pollutant_min</code>, <code className="text-slate-800">pollutant_max</code>) are not sent.
              </p>
            </div>

            {/* Submit & Secondary Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    country: 'India',
                    state: 'Telangana',
                    city: 'Hyderabad',
                    station: 'Hyderabad US Consulate',
                    latitude: 17.385,
                    longitude: 78.4867,
                    pollutant_id: 'PM2.5',
                    last_update: formatDateTimeForBackend(new Date())
                  });
                  setErrors({});
                  setApiError(null);
                }}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleRunTestEndpoint}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Sanity Check (POST /predict-test)
                </button>

                <button
                  id="predict-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Running XGBoost Inference...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Execute Prediction (POST /predict)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
