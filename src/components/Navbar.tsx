import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wind, Menu, X, User, LogOut, LayoutDashboard, History, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const navItemClass = (tab: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      currentTab === tab
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
    }`;

  const mobileItemClass = (tab: string) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      currentTab === tab
        ? 'bg-emerald-600 text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700'
    }`;

  return (
    <nav id="main-navigation" className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <button
              id="brand-logo-btn"
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 focus:outline-none group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  AirQuality<span className="text-emerald-600 font-extrabold">.ML</span>
                </span>
                <span className="text-[11px] font-medium text-slate-700 tracking-wide uppercase">
                  XGBoost Regressor
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <button id="nav-home-btn" onClick={() => handleNav('home')} className={navItemClass('home')}>
                Home
              </button>
              <button id="nav-about-btn" onClick={() => handleNav('about')} className={navItemClass('about')}>
                About
              </button>
              <button id="nav-contact-btn" onClick={() => handleNav('contact')} className={navItemClass('contact')}>
                Contact Us
              </button>
              {user && (
                <>
                  <button id="nav-predict-btn" onClick={() => handleNav('predict')} className={navItemClass('predict')}>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Prediction Form
                    </span>
                  </button>
                  <button id="nav-dashboard-btn" onClick={() => handleNav('dashboard')} className={navItemClass('dashboard')}>
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </span>
                  </button>
                  <button id="nav-history-btn" onClick={() => handleNav('history')} className={navItemClass('history')}>
                    <span className="flex items-center gap-1.5">
                      <History className="w-4 h-4" />
                      History
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Desktop Right / User Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  id="nav-profile-btn"
                  onClick={() => handleNav('profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">{user.displayName || user.email}</span>
                </button>
                <button
                  id="nav-logout-btn"
                  onClick={async () => {
                    await signOut();
                    handleNav('home');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="nav-signin-btn"
                  onClick={() => handleNav('signin')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => handleNav('signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-menu-panel" className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button id="mobile-home-btn" onClick={() => handleNav('home')} className={mobileItemClass('home')}>
            Home
          </button>
          <button id="mobile-about-btn" onClick={() => handleNav('about')} className={mobileItemClass('about')}>
            About
          </button>
          <button id="mobile-contact-btn" onClick={() => handleNav('contact')} className={mobileItemClass('contact')}>
            Contact Us
          </button>
          {user ? (
            <>
              <button id="mobile-predict-btn" onClick={() => handleNav('predict')} className={mobileItemClass('predict')}>
                Prediction Form
              </button>
              <button id="mobile-dashboard-btn" onClick={() => handleNav('dashboard')} className={mobileItemClass('dashboard')}>
                Dashboard
              </button>
              <button id="mobile-history-btn" onClick={() => handleNav('history')} className={mobileItemClass('history')}>
                Prediction History
              </button>
              <button id="mobile-profile-btn" onClick={() => handleNav('profile')} className={mobileItemClass('profile')}>
                Profile
              </button>
              <div className="pt-2 border-t border-slate-100">
                <button
                  id="mobile-logout-btn"
                  onClick={async () => {
                    await signOut();
                    handleNav('home');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                id="mobile-signin-btn"
                onClick={() => handleNav('signin')}
                className="w-full text-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Sign In
              </button>
              <button
                id="mobile-signup-btn"
                onClick={() => handleNav('signup')}
                className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
