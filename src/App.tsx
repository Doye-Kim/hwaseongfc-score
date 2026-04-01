import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage, AdminPage, MainPage, QuizPage } from './pages';

export default function App() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route
          path='/admin'
          element={user && isAdmin ? <AdminPage /> : <LoginPage />}
        />
        <Route path='/quiz' element={<QuizPage />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
}
