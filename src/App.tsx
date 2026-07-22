import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from './contexts/AuthContext';
import { AppBuilderProvider } from './contexts/AppBuilderContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded page components for optimal route code-splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AppBuilder = lazy(() => import('./pages/AppBuilder'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const TemplateLibraryPage = lazy(() => import('./pages/TemplateLibraryPage'));
const VoiceCloningStudioPage = lazy(() => import('./pages/VoiceCloningStudioPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      <p className="text-sm font-medium text-slate-400">Loading PolyLingo AI Workspace…</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary title="Application Error">
      <ToastProvider>
        <AuthProvider>
          <AppBuilderProvider>
            <DndProvider backend={HTML5Backend}>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="min-h-screen bg-slate-950 text-slate-100">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/setup" element={<SetupPage />} />
                      <Route path="/templates" element={<TemplateLibraryPage />} />
                      <Route path="/terms" element={<LegalPage type="terms" />} />
                      <Route path="/privacy" element={<LegalPage type="privacy" />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/builder/:appId?"
                        element={
                          <ProtectedRoute>
                            <AppBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/voice-studio"
                        element={
                          <ProtectedRoute>
                            <VoiceCloningStudioPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </div>
              </Router>
            </DndProvider>
          </AppBuilderProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
