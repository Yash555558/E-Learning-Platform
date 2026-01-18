import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminPanel from '../components/AdminPanel';

function Admin() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPanel />
    </div>
  );
}

export default Admin;