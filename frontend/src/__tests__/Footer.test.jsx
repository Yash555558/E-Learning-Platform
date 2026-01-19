import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

describe('Footer Component', () => {
  test('renders contact information correctly', () => {
    render(<Footer />);
    
    // Check that the contact information is present
    expect(screen.getByText(/yash777881@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 9548262709/i)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 E-Learning Platform/i)).toBeInTheDocument();
  });

  test('renders all sections correctly', () => {
    render(<Footer />);
    
    // Check that all sections are present
    expect(screen.getByText(/E-Learning Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Links/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test('renders social media links', () => {
    render(<Footer />);
    
    // Check that the social media links exist
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });
});