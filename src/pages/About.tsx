import React from 'react';
import { Cpu, Server, Shield, Database, FileCode, CheckCircle, ExternalLink } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div id="about-page" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            Academic & System Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About the Air Quality Prediction System
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            A comprehensive technical overview of the machine learning pipeline, regression model, FastAPI service, and secure cloud persistence.
          </p>
        </div>

        {/* Section 1: Concept & Domain */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <Cpu className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">1. Air Quality Prediction & Problem Statement</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Air pollution poses critical public health hazards worldwide. Atmospheric pollutants like Particulate Matter (PM2.5, PM10), Nitrogen Dioxide (NO2), and Sulfur Dioxide (SO2) fluctuate drastically based on geographic topology, industrial activity, traffic volume, and atmospheric conditions.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            This project provides data-driven statistical estimation of the mean pollutant level (<code className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded text-xs">pollutant_avg</code>) at specific continuous monitoring stations, aiding researchers and public health analysts in tracking ambient environmental conditions.
          </p>
        </section>

        {/* Section 2: Machine Learning & XGBoost Model */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <Database className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">2. The Machine Learning Model (XGBoost Regressor)</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            The selected model for production regression is an <strong className="font-semibold text-slate-900">XGBoost (Extreme Gradient Boosting) Regressor</strong>. XGBoost was chosen because gradient-boosted decision trees effectively capture non-linear relationships, geographic clustering effects, and temporal periodicity without overfitting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Model Target</h3>
              <p className="text-sm font-semibold text-emerald-700 font-mono">pollutant_avg</p>
              <p className="text-xs text-slate-700 mt-1">Average concentration of the specified pollutant</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Saved Model Artifact</h3>
              <p className="text-xs font-mono text-slate-800">app/pkl file/xgboost_air_quality.pkl</p>
              <p className="text-xs text-slate-700 mt-1">Self-contained scikit-learn / joblib pipeline</p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Feature Transformation Pipeline:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Categorical Features:</span>
                country, state, city, station, pollutant_id
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Numerical Features:</span>
                latitude, longitude, year, month, day, hour, day_of_week
              </div>
            </div>
            <p className="text-xs text-slate-700 mt-2 italic">
              Note: The backend derives year, month, day, hour, and day_of_week from the submitted <code className="text-slate-800">last_update</code> timestamp string. The frontend does not send pre-computed temporal features.
            </p>
          </div>
        </section>

        {/* Section 3: FastAPI Backend */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <Server className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">3. FastAPI Production Backend</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            The inference engine is hosted on a high-throughput Python FastAPI service deployed to Render. FastAPI was selected for its native async support, automated Pydantic schema validation, and automatic OpenAPI Swagger documentation generation.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="p-2.5 border-b border-slate-200">Method</th>
                  <th className="p-2.5 border-b border-slate-200">Path</th>
                  <th className="p-2.5 border-b border-slate-200">Function</th>
                  <th className="p-2.5 border-b border-slate-200">Production Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-sky-700">GET</td>
                  <td className="p-2.5">/</td>
                  <td className="p-2.5 font-sans">API root status verification</td>
                  <td className="p-2.5 font-sans text-emerald-700 font-semibold">Operational (200 OK)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-sky-700">GET</td>
                  <td className="p-2.5">/health</td>
                  <td className="p-2.5 font-sans">Model readiness health check</td>
                  <td className="p-2.5 font-sans text-slate-800 font-semibold">Active endpoint</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-700">POST</td>
                  <td className="p-2.5">/predict</td>
                  <td className="p-2.5 font-sans">Production XGBoost inference</td>
                  <td className="p-2.5 font-sans text-slate-800">Target inference endpoint</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-emerald-700">POST</td>
                  <td className="p-2.5">/predict-test</td>
                  <td className="p-2.5 font-sans">Input validation & sanity test</td>
                  <td className="p-2.5 font-sans text-emerald-700 font-semibold">Operational (200 OK)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Firebase & Security Rules */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">4. Firebase Authentication & Firestore Security</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            All user prediction records are strictly scoped to the authenticated user's Firebase UID. Users can authenticate using email/password or Google Sign-In with session persistence.
          </p>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
            <div className="text-slate-400">// Firestore Data Hierarchy</div>
            <div>/users/{'{userId}'}</div>
            <div className="pl-4">└── /predictions/{'{predictionId}'}</div>
            <div className="text-slate-400 mt-2">// Security Rule Invariant</div>
            <div className="text-emerald-400">allow read, write: if request.auth.uid == userId;</div>
          </div>
          <p className="text-xs text-slate-700">
            A strict default-deny rule prevents unauthenticated access or cross-user record tampering.
          </p>
        </section>

        {/* Section 5: References */}
        <div className="pt-4 flex flex-wrap gap-4 text-xs">
          <a
            href="https://air-quality-predictions.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <span>FastAPI Interactive Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://github.com/poshettimanishkumar/air-quality-prediction"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
          >
            <span>Project GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
