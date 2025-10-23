import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = user?.role === 'rep'
    ? [
        { path: '/', label: 'Dashboard' },
        { path: '/daily-entry', label: 'Daily Entry' },
        { path: '/weekly-goals', label: 'Weekly Goals' },
        { path: '/six996-goals', label: '6996 Goals' },
      ]
    : [
        { path: '/', label: 'Team Dashboard' },
        { path: '/daily-entry', label: 'My Performance' },
      ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Goal Sheet App
            </Link>

            <nav className="hidden md:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
            <button onClick={logout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
