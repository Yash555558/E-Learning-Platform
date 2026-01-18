import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Courses from '../pages/Courses';

// Mock axios to avoid actual API calls
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { courses: [] } }))
}));

describe('CourseList Component', () => {
  test('renders course list page', async () => {
    render(
      <BrowserRouter>
        <Courses />
      </BrowserRouter>
    );

    // Wait for component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/All Courses/i)).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    render(
      <BrowserRouter>
        <Courses />
      </BrowserRouter>
    );

    // Initially, there should be a loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument(); // This assumes loading state has aria-label or role
  });
});