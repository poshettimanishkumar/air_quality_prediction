import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Sparkles } from 'lucide-react';

interface SignInProps {
  setCurrentTab: (tab: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ setCurrentTab }) => {
  const { signInWithEmail, signInWithGoogle, isFirebaseLive } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      setCurrentTab('dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Please check credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setCurrentTab('dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('researcher@airquality.ai');
    setPassword('Research@2024');
  };

  return (
    <div id="signin-page" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to AirQuality.ML</h2>
        <p className="mt-2 text-sm text-slate-600">
          Access your prediction history and run XGBoost inference
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isFirebaseLive && (
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-800">
              <strong>Environment Ready:</strong> Firebase auth is operating in client session mode. You can sign in with any email/password or use Google Sign-In immediately.
            </div>
          )}

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-700 font-medium">Or continue with email</span>
            </div>
          </div>

          <form id="signin-form" onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="signin-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label htmlFor="signin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button
              id="signin-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Demo helper */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-slate-700 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill Demo Credentials</span>
            </button>
            <button
              id="goto-signup-btn"
              type="button"
              onClick={() => setCurrentTab('signup')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Need an account? Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
