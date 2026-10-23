import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/DataContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import OrganizationPage from './pages/OrganizationPage';

function App() {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public route: if already logged in, skip login and go to dashboard */}
        <Route
          path="/"
          element={!currentUser ? <AuthPage /> : <Navigate to="/home" />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

       {/* THE PROJECT DASHBOARD (Now requires a Project ID in the URL!) */}
        <Route 
          path="/org/:orgId" 
          element={
            <ProtectedRoute>
              <OrganizationPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/project/:projectId" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>} 
          />
        
      </Routes>
    </Router>
  );
}

export default App;
