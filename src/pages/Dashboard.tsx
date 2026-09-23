import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPredictions } from '../services/firestore';
import { StoredPredictionRecord } from '../types';
import {
  LayoutDashboard,
  Sparkles,
  History,
  User,
  Clock,
  TrendingUp,
  MapPin,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  onSelectPredictionDetail: (record: StoredPredictionRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab, onSelectPredictionDetail }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<StoredPredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const records = await getUserPredictions(user.uid);
      setPredictions(records);
    } catch (err) {
      console.error('Failed fetching user dashboard history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const latest = predictions.length > 0 ? predictions[0] : null;

  return (
    <div id="dashboard-page" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>User Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Researcher'}!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Monitor XGBoost Regressor predictions, review historical station inferences, and manage atmospheric data pipelines.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="dashboard-quick-predict-btn"
              onClick={() => setCurrentTab('predict')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Quick Predict</span>
            </button>
            <button
              id="dashboard-view-history-btn"
              onClick={() => setCurrentTab('history')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
            >
              <History className="w-4 h-4" />
              <span>View History</span>
            </button>
            <button
              id="dashboard-profile-btn"
              onClick={() => setCurrentTab('profile')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
              title="Profile Settings"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Inferences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Inferences</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {loading ? '...' : predictions.length}
              </span>
              <p className="text-xs text-slate-700 mt-1">Authenticated user predictions in Firestore</p>
            </div>
          </div>

          {/* Model Deployment */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Active ML Model</span>
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl font-bold text-slate-900">XGBoost Regressor</span>
              <p className="text-xs text-slate-700 mt-1">Target: <code className="font-mono text-emerald-700">pollutant_avg</code></p>
            </div>
          </div>

          {/* Latest Recorded Value */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Latest Result</span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {loading
                  ? '...'
                  : latest
                  ? `${latest.outputData.predicted_pollutant_avg.toFixed(1)}`
                  : 'N/A'}
              </span>
              <span className="text-xs text-slate-700 ml-1">µg/m³</span>
              <p className="text-xs text-slate-700 mt-1">
                {latest ? `${latest.inputData.pollutant_id} @ ${latest.inputData.city}` : 'No predictions executed yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Prediction Detail Card */}
        {latest && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Most Recent Prediction Record</span>
              </h2>
              <button
                onClick={() => {
                  onSelectPredictionDetail(latest);
                  setCurrentTab('history');
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Inspect in History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-700 block">Station / City</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">
                  {latest.inputData.station}
                </span>
                <span className="text-slate-700 text-[11px]">{latest.inputData.city}, {latest.inputData.state}</span>
              </div>
              <div>
                <span className="text-slate-700 block">Target Pollutant</span>
                <span className="font-bold text-emerald-700 text-sm mt-0.5 block font-mono">
                  {latest.inputData.pollutant_id}
                </span>
                <span className="text-slate-700 text-[11px]">{latest.inputData.country}</span>
              </div>
              <div>
                <span className="text-slate-700 block">Predicted Avg</span>
                <span className="font-extrabold text-slate-900 text-base mt-0.5 block font-mono">
                  {latest.outputData.predicted_pollutant_avg} µg/m³
                </span>
                <span className="text-slate-700 text-[11px]">Model: {latest.modelName}</span>
              </div>
              <div>
                <span className="text-slate-700 block">Recorded At</span>
                <span className="text-slate-700 font-mono text-[11px] mt-0.5 block">
                  {new Date(latest.createdAt).toLocaleDateString()} {new Date(latest.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Inferences List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Inferences</h2>
              <p className="text-xs text-slate-700 mt-0.5">Real user-submitted predictions persisted in Cloud Firestore</p>
            </div>
            <button
              onClick={() => setCurrentTab('history')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-700">Loading user history from Firestore...</div>
          ) : predictions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No predictions recorded yet</h3>
              <p className="text-xs text-slate-700 max-w-sm mx-auto">
                You haven't run any air quality predictions in this account. Submit a new station query to populate your dashboard history.
              </p>
              <button
                id="dashboard-start-first-prediction-btn"
                onClick={() => setCurrentTab('predict')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Your First Prediction</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {predictions.slice(0, 5).map(record => (
                <div
                  key={record.id}
                  onClick={() => {
                    onSelectPredictionDetail(record);
                    setCurrentTab('history');
                  }}
                  className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {record.inputData.pollutant_id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {record.inputData.station}, {record.inputData.city}
                      </p>
                      <p className="text-xs text-slate-700 flex items-center gap-2">
                        <span>{record.inputData.country}</span>
                        <span>•</span>
                        <span>{record.inputData.last_update}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {record.outputData.predicted_pollutant_avg.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-700 ml-1">µg/m³</span>
                      <span className="block text-[10px] text-slate-700">Model: {record.modelName}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
