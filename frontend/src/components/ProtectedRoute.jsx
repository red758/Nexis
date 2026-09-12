import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// ProtectedRoute: guards a route from unauthenticated users.
//
// If the user is NOT logged in, they get redirected to "/" (login page).
// If they ARE logged in, the children (the actual page) are rendered.
//
// Usage in App.jsx:
//   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
//
// This way, no matter how many routes you add, the auth check
// is written ONCE here — not repeated on every route.

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);

  // Wait for auth check to finish before deciding
  if (loading) return null;

  // Not logged in? Send them to the login page
  if (!currentUser) return <Navigate to="/" replace />;

  // Logged in? Render the actual page
  return children;
}
