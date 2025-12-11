import { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import BillingDashboardPage from './pages/BillingDashboardPage';
import AdminPage from './pages/AdminPage';
import InterviewPage from './features/ai-interview';
import MemoryGraphPage from './features/memory-graph';
import VoiceCloningPage from './features/voice-cloning';
import AvatarServicePage from './features/avatar-service';
import MultimediaPage from './features/multimedia';
import NotFoundPage from './pages/NotFoundPage';
import AdminRoute from './components/auth/AdminRoute';
import NormalUserRoute from './components/auth/NormalUserRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import FeatureErrorHandler from './components/FeatureErrorHandler';
import { usePWA } from './hooks/usePWA';

// Create context for interview state
interface InterviewContextType {
  isInterviewActive: boolean;
  setIsInterviewActive: (active: boolean) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

function AppContent() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const location = useLocation();
  const { i18n } = useTranslation();
  const { registerServiceWorker } = usePWA();

  // Register service worker on app load
  useEffect(() => {
    registerServiceWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide header on login, register, and payment pages
  const shouldShowHeader = !isInterviewActive && 
    location.pathname !== '/login' && 
    location.pathname !== '/register' &&
    location.pathname !== '/subscription/success' &&
    location.pathname !== '/subscription/cancel';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Always keep UI in LTR - only content text can be RTL
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', currentLang);
  }, [i18n.language]);

  return (
    <InterviewContext.Provider value={{ isInterviewActive, setIsInterviewActive }}>
      <FeatureErrorHandler />
      <div className="min-h-screen flex flex-col">
        {shouldShowHeader && <Header />}
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscription/success" element={<PaymentSuccessPage />} />
            <Route path="/subscription/cancel" element={<PaymentCancelPage />} />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            
            {/* Protected routes - Normal users only */}
            <Route 
              path="/billing" 
              element={
                <NormalUserRoute>
                  <BillingDashboardPage />
                </NormalUserRoute>
              } 
            />
            <Route 
              path="/interview" 
              element={
                <NormalUserRoute>
                  <InterviewPage />
                </NormalUserRoute>
              } 
            />
            <Route 
              path="/memory-graph" 
              element={
                <NormalUserRoute>
                  <MemoryGraphPage />
                </NormalUserRoute>
              } 
            />
            <Route 
              path="/voice-cloning" 
              element={
                <NormalUserRoute>
                  <VoiceCloningPage />
                </NormalUserRoute>
              } 
            />
            <Route 
              path="/avatar-service" 
              element={
                <NormalUserRoute>
                  <AvatarServicePage />
                </NormalUserRoute>
              } 
            />
            <Route 
              path="/multimedia" 
              element={
                <NormalUserRoute>
                  <MultimediaPage />
                </NormalUserRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </InterviewContext.Provider>
  );
}

function ToastContainerWrapper() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="mt-16"
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
      <ToastContainerWrapper />
      <PWAInstallPrompt />
      <OfflineIndicator />
    </AuthProvider>
  );
}

export default App