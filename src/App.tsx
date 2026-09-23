import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StatusBanner } from './components/StatusBanner';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Predict } from './pages/Predict';
import { PredictResult } from './pages/PredictResult';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { PredictionInput, PredictionSuccessResponse, StoredPredictionRecord } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);
  const [lastOutput, setLastOutput] = useState<PredictionSuccessResponse | null>(null);
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<StoredPredictionRecord | null>(null);

  const handlePredictionComplete = (input: PredictionInput, output: PredictionSuccessResponse) => {
    setLastInput(input);
    setLastOutput(output);
  };

  const handleSelectPredictionDetail = (record: StoredPredictionRecord) => {
    setSelectedHistoryDetail(record);
  };

  // Protected route guard helper: if user tries to access private views while not logged in
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'signin':
        return <SignIn setCurrentTab={setCurrentTab} />;
      case 'signup':
        return <SignUp setCurrentTab={setCurrentTab} />;
      case 'predict':
        return (
          <Predict
            setCurrentTab={setCurrentTab}
            onPredictionComplete={handlePredictionComplete}
          />
        );
      case 'result':
        return (
          <PredictResult
            input={lastInput}
            output={lastOutput}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'dashboard':
        return user ? (
          <Dashboard
            setCurrentTab={setCurrentTab}
            onSelectPredictionDetail={handleSelectPredictionDetail}
          />
        ) : (
          <SignIn setCurrentTab={setCurrentTab} />
        );
      case 'history':
        return user ? (
          <History
            setCurrentTab={setCurrentTab}
            selectedDetail={selectedHistoryDetail}
            setSelectedDetail={setSelectedHistoryDetail}
          />
        ) : (
          <SignIn setCurrentTab={setCurrentTab} />
        );
      case 'profile':
        return user ? (
          <Profile setCurrentTab={setCurrentTab} />
        ) : (
          <SignIn setCurrentTab={setCurrentTab} />
        );
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Real-time backend status notification */}
      <StatusBanner />

      {/* Global Navigation Header */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Global Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
