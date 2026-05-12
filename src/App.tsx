import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainPage, QuizPage } from './pages';

const AdminRoute = lazy(() => import('./pages/AdminRoute'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route
          path='/admin'
          element={
            <Suspense fallback={null}>
              <AdminRoute />
            </Suspense>
          }
        />
        <Route path='/quiz' element={<QuizPage />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
}
