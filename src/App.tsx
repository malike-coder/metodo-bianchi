import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/layout/Header';
import WelcomeScreen from './components/client/WelcomeScreen';
import ConsentScreen from './components/client/ConsentScreen';
import { WizardScreen } from './components/client/WizardScreen';
import ProcessingScreen from './components/client/ProcessingScreen';
import { ResultsScreen } from './components/client/ResultsScreen';
import ProfessionalPanel from './components/professional/ProfessionalPanel';

function ClientApp() {
  const { clientScreen } = useAppStore();

  return (
    /* pt-16 mobile (h-16 header) → pt-[72px] sm (h-[72px] header) */
    <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
      {clientScreen === 'welcome'    && <WelcomeScreen />}
      {clientScreen === 'consent'    && <ConsentScreen />}
      {clientScreen === 'wizard'     && <WizardScreen />}
      {clientScreen === 'processing' && <ProcessingScreen />}
      {clientScreen === 'results'    && <ResultsScreen />}
    </main>
  );
}

export default function App() {
  const { activeView, isDarkMode } = useAppStore();

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={activeView === 'client' ? <ClientApp /> : (
            <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
              <ProfessionalPanel />
            </main>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
