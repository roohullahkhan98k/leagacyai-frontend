import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext, useContext, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InterviewPage from './features/ai-interview';
import MemoryGraphPage from './features/memory-graph';
import VoiceCloningPage from './features/voice-cloning';
import AvatarServicePage from './features/avatar-service';
import MultimediaPage from './features/multimedia';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';

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

function App() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <InterviewContext.Provider value={{ isInterviewActive, setIsInterviewActive }}>
          <Router>
            <div className="min-h-screen flex flex-col">
              {!isInterviewActive && <Header />}
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route 
                    path="/interview" 
                    element={
                      <ProtectedRoute>
                        <InterviewPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/memory-graph" 
                    element={
                      <ProtectedRoute>
                        <MemoryGraphPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/voice-cloning" 
                    element={
                      <ProtectedRoute>
                        <VoiceCloningPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/avatar-service" 
                    element={
                      <ProtectedRoute>
                        <AvatarServicePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/multimedia" 
                    element={
                      <ProtectedRoute>
                        <MultimediaPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </InterviewContext.Provider>
      </ToastProvider>
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
    </AuthProvider>
  );
}

export default App