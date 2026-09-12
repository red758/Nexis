import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!currentUser) return <Navigate to="/" replace />;

  return children;
}
