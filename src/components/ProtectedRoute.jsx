import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-teal animate-pulse">Authenticating...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}