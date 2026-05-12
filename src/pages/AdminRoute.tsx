import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminPage from './AdminPage';
import LoginPage from './LoginPage';

function AdminContent() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  return user && isAdmin ? <AdminPage /> : <LoginPage />;
}

export default function AdminRoute() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
