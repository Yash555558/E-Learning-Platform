import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">E-Learning Platform</Link>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/courses" className="hover:text-blue-200">Courses</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.name}</span>
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200">Admin</Link>
              )}
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-100 px-3 py-1 rounded">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;