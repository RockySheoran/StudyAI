'use client';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">
            Current Affairs
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md ${
                location.pathname === '/' ? 'bg-blue-900' : 'hover:bg-blue-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/history"
              className={`px-3 py-2 rounded-md ${
                location.pathname === '/history' ? 'bg-blue-900' : 'hover:bg-blue-700'
              }`}
            >
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;