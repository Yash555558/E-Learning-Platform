import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import CourseDetail from '../pages/CourseDetail';
import { useAuth } from '../contexts/AuthContext';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const MockedCourseDetail = () => {
  return (
    <BrowserRouter>
      <CourseDetail />
    </BrowserRouter>
  );
};

describe('CourseDetail Component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({ id: 'test-course-id' });
    useAuth.mockReturnValue({
      user: null,
    });
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ course: null }),
      ok: true,
    });

    render(<MockedCourseDetail />);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('displays course information when data is loaded', async () => {
    const mockCourse = {
      _id: 'test-course-id',
      title: 'Test Course',
      description: 'Test Description',
      price: 100,
      category: 'Development',
      difficulty: 'Beginner',
      lessons: [
        { title: 'Lesson 1', contentHtml: 'Content 1' },
        { title: 'Lesson 2', contentHtml: 'Content 2' }
      ]
    };

    fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ course: mockCourse }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ enrollments: [] }),
        ok: true,
      });

    render(<MockedCourseDetail />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Course/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Test Course/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Development/i)).toBeInTheDocument();
  });
});