import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wind, ArrowRight, Shield, Cpu, Activity, Database, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();

  return (
    <div id="home-page" className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Production ML Regression Pipeline</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Air Quality Prediction <br className="hidden sm:inline" />
              <span className="text-emerald-600">Powered by Machine Learning</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Predict atmospheric pollutant concentrations (<code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-base font-semibold">pollutant_avg</code>) across monitoring stations using an optimized XGBoost Regressor model served via a high-performance FastAPI backend.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <>
                  <button
                    id="hero-predict-now-btn"
                    onClick={() => setCurrentTab('predict')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Run Air Quality Prediction</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="hero-dashboard-btn"
                    onClick={() => setCurrentTab('dashboard')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all"
                  >
                    <span>Go to Dashboard</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="hero-get-started-btn"
                    onClick={() => setCurrentTab('signup')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="hero-signin-btn"
                    onClick={() => setCurrentTab('signin')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all"
                  >
                    <span>Sign In to Account</span>
                  </button>
                  <button
                    id="hero-explore-btn"
                    onClick={() => setCurrentTab('about')}
                    className="w-full sm:w-auto text-sm font-medium text-slate-600 hover:text-emerald-700 px-3 py-2"
                  >
                    Learn More →
                  </button>
                </>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8 border-t border-slate-200 text-left">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="block text-xs font-semibold text-slate-700 uppercase">Model</span>
                <span className="text-sm font-bold text-slate-900">XGBoost Regressor</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="block text-xs font-semibold text-slate-700 uppercase">Target</span>
                <span className="text-sm font-bold text-emerald-600">pollutant_avg</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="block text-xs font-semibold text-slate-700 uppercase">Backend</span>
                <span className="text-sm font-bold text-slate-900">FastAPI (Render)</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="block text-xs font-semibold text-slate-700 uppercase">Storage</span>
                <span className="text-sm font-bold text-sky-600">Cloud Firestore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              End-to-End Prediction Architecture
            </h2>
            <p className="mt-3 text-slate-600">
              How geographical coordinates, monitoring station metadata, and timestamp attributes are transformed to predict pollutant levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Input Station Parameters</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide country, state, city, monitoring station name, GPS coordinates (latitude, longitude), pollutant type (such as PM2.5), and observation timestamp.
              </p>
              <div className="mt-4 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                POST /predict payload validation
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Feature Engineering & Inference</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The FastAPI backend parses <code className="text-xs font-mono">last_update</code> into temporal features (year, month, day, hour, day_of_week) and applies the trained XGBoost pipeline.
              </p>
              <div className="mt-4 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                Pipeline: app/pkl file/xgboost_air_quality.pkl
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Results & Firestore Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                View predicted pollutant average with associated model metadata. Prediction records are securely saved under the authenticated user's profile in Cloud Firestore.
              </p>
              <div className="mt-4 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                users/{'{userId}'}/predictions/{'{predictionId}'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Specifications & Honest Disclaimers */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Machine Learning Transparency & Disclaimer</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              This application interfaces directly with a pre-trained regression pipeline. In adherence to rigorous scientific and portfolio engineering standards:
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>The regression target is strictly <strong className="font-semibold text-slate-900">pollutant_avg</strong>; features like <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">pollutant_min</code> and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">pollutant_max</code> are never sent to the model.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>No arbitrary or synthetic ML features are invented on the frontend. The backend remains the sole authority for model execution.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Prediction values reflect the statistical relationships learned during training and should be evaluated alongside ground-truth environmental sensors.</span>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-700">FastAPI Swagger: <code className="text-slate-700">/docs</code></span>
              <button
                id="home-cta-predict-btn"
                onClick={() => setCurrentTab(user ? 'predict' : 'signin')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <span>{user ? 'Open Prediction Form' : 'Sign in to Predict'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
