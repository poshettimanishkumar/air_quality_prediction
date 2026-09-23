import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPredictions, deleteUserPrediction } from '../services/firestore';
import { StoredPredictionRecord } from '../types';
import {
  History as HistoryIcon,
  Trash2,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  X,
  Database,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface HistoryProps {
  setCurrentTab: (tab: string) => void;
  selectedDetail: StoredPredictionRecord | null;
  setSelectedDetail: (record: StoredPredictionRecord | null) => void;
}

export const History: React.FC<HistoryProps> = ({ setCurrentTab, selectedDetail, setSelectedDetail }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<StoredPredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserPredictions(user.uid);
      setRecords(data);
    } catch (err) {
      console.error('Failed fetching predictions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setDeletingId(id);
    try {
      await deleteUserPrediction(user.uid, id);
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedDetail?.id === id) {
        setSelectedDetail(null);
      }
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecords = records.filter(rec => {
    const term = searchFilter.toLowerCase();
    return (
      rec.inputData.city.toLowerCase().includes(term) ||
      rec.inputData.station.toLowerCase().includes(term) ||
      rec.inputData.pollutant_id.toLowerCase().includes(term) ||
      rec.inputData.state.toLowerCase().includes(term)
    );
  });

  return (
    <div id="history-page" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <HistoryIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>User Prediction Archive</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prediction History</h1>
            <p className="mt-1 text-sm text-slate-600">
              Authenticated user records scoped by UID: <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{user?.uid}</code>
            </p>
          </div>

          <button
            id="history-new-prediction-btn"
            onClick={() => setCurrentTab('predict')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Prediction</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-700 absolute left-3 top-3" />
            <input
              id="history-search-input"
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter by city, station, pollutant..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-700 ml-auto font-medium">
            Showing {filteredRecords.length} of {records.length} records
          </span>
        </div>

        {/* Records Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-700">Loading prediction history from Firestore...</div>
          ) : records.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No predictions recorded yet</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Every successful inference made through the prediction form is permanently archived here for the active account.
              </p>
              <button
                onClick={() => setCurrentTab('predict')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Run a Prediction Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Station & Location</th>
                    <th className="p-3.5">Pollutant</th>
                    <th className="p-3.5">Predicted Avg</th>
                    <th className="p-3.5">Model</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Recorded At</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map(rec => (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedDetail(rec)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block text-sm">
                          {rec.inputData.station}
                        </span>
                        <span className="text-[11px] text-slate-700">
                          {rec.inputData.city}, {rec.inputData.state}, {rec.inputData.country}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {rec.inputData.pollutant_id}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-sm font-bold text-slate-900">
                        {rec.outputData.predicted_pollutant_avg.toFixed(2)} µg/m³
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {rec.modelName}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rec.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-700">
                        {new Date(rec.createdAt).toLocaleDateString()} {new Date(rec.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={e => handleDelete(rec.id, e)}
                            disabled={deletingId === rec.id}
                            className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal / Drawer */}
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedDetail(null)}
                className="absolute top-4 right-4 text-slate-700 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                <Cpu className="w-4 h-4" />
                <span>Prediction Record Detail</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedDetail.inputData.station}
              </h2>
              <p className="text-xs text-slate-700">
                Record ID: <code className="font-mono text-[10px]">{selectedDetail.id}</code>
              </p>

              {/* Big metric */}
              <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Predicted Pollutant Average ({selectedDetail.outputData.target})
                </span>
                <div className="text-4xl font-extrabold text-slate-900 font-mono mt-1">
                  {selectedDetail.outputData.predicted_pollutant_avg.toFixed(2)} µg/m³
                </div>
                <span className="text-xs text-slate-700 mt-1 block">
                  Model: <strong className="text-slate-800">{selectedDetail.modelName}</strong> ({selectedDetail.modelId})
                </span>
              </div>

              {/* Input details */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Submitted Input Parameters:</h3>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <div><span className="text-slate-700 font-sans">Country:</span> {selectedDetail.inputData.country}</div>
                  <div><span className="text-slate-700 font-sans">State:</span> {selectedDetail.inputData.state}</div>
                  <div><span className="text-slate-700 font-sans">City:</span> {selectedDetail.inputData.city}</div>
                  <div><span className="text-slate-700 font-sans">Station:</span> {selectedDetail.inputData.station}</div>
                  <div><span className="text-slate-700 font-sans">Latitude:</span> {selectedDetail.inputData.latitude}</div>
                  <div><span className="text-slate-700 font-sans">Longitude:</span> {selectedDetail.inputData.longitude}</div>
                  <div><span className="text-slate-700 font-sans">Pollutant:</span> {selectedDetail.inputData.pollutant_id}</div>
                  <div><span className="text-slate-700 font-sans">last_update:</span> {selectedDetail.inputData.last_update}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
