import React from 'react';
import { Wind, Github, ExternalLink, ShieldCheck, Database, Cpu } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Model */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Wind className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                AirQuality<span className="text-emerald-400">.ML</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              An end-to-end Machine Learning web application predicting pollutant average concentrations (<code className="text-emerald-400 font-mono text-xs">pollutant_avg</code>) using an XGBoost Regressor model pipeline served via FastAPI and secured with Firebase.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Model: XGBoost Regressor
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                Target: pollutant_avg
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Auth: Firebase + Firestore
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  id="footer-home-btn"
                  onClick={() => setCurrentTab('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  id="footer-about-btn"
                  onClick={() => setCurrentTab('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Project
                </button>
              </li>
              <li>
                <button
                  id="footer-predict-btn"
                  onClick={() => setCurrentTab('predict')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Air Quality Prediction
                </button>
              </li>
              <li>
                <button
                  id="footer-contact-btn"
                  onClick={() => setCurrentTab('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: API & Repository References */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">ML Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  id="footer-backend-api-link"
                  href="https://air-quality-predictions.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>FastAPI Production API</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  id="footer-docs-link"
                  href="https://air-quality-predictions.onrender.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>FastAPI Swagger /docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  id="footer-github-link"
                  href="https://github.com/poshettimanishkumar/air-quality-prediction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-700">
          <p>
            © {new Date().getFullYear()} Air Quality Prediction ML Project. Built with React, TypeScript, FastAPI, and Firebase.
          </p>
          <p className="max-w-xl text-center md:text-right">
            Disclaimer: Predictions are generated by a trained regression model based on historical monitoring station records. Results are for research, educational, and informational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};
