import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

const MockedHeader = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
    });
  });

  test('renders logo and navigation links', () => {
    render(<MockedHeader />);
    
    expect(screen.getByText(/E-Learning Platform/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Courses/i })).toBeInTheDocument();
  });

  test('shows login/signup buttons when user is not logged in', () => {
    render(<MockedHeader />);
    
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
  });

  test('shows user menu when user is logged in', () => {
    useAuth.mockReturnValue({
      user: { name: 'Test User', role: 'user' },
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
    });

    render(<MockedHeader />);
    
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
  });
});