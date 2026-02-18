import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage, ProfileSetupPage, AdminPage, MainPage } from './pages';

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route path='*' element={<LoginPage />} />
        ) : !profile ? (
          <Route path='*' element={<ProfileSetupPage />} />
        ) : profile.isAdmin ? (
          <>
            <Route path='/admin' element={<AdminPage />} />
            <Route path='*' element={<Navigate to='/admin' />} />
          </>
        ) : (
          <>
            <Route path='/' element={<MainPage />} />
            <Route path='*' element={<Navigate to='/' />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
