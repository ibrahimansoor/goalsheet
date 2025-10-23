import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RepDashboard from './pages/RepDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import DailyEntry from './pages/DailyEntry';
import WeeklyGoals from './pages/WeeklyGoals';
import Six996Goals from './pages/Six996Goals';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                {user?.role === 'rep' ? <RepDashboard /> : <ManagerDashboard />}
              </PrivateRoute>
            }
          />

          <Route
            path="/daily-entry"
            element={
              <PrivateRoute>
                <DailyEntry />
              </PrivateRoute>
            }
          />

          <Route
            path="/weekly-goals"
            element={
              <PrivateRoute>
                <WeeklyGoals />
              </PrivateRoute>
            }
          />

          <Route
            path="/six996-goals"
            element={
              <PrivateRoute>
                <Six996Goals />
              </PrivateRoute>
            }
          />

          <Route
            path="/team"
            element={
              <PrivateRoute allowedRoles={['manager', 'leader', 'admin']}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
