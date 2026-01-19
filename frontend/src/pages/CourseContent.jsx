import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LessonPlayer from '../components/LessonPlayer';

function CourseContent() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }
        const courseData = await courseResponse.json();
        setCourse(courseData.course);

        // Fetch user's enrollment for this course
        const enrollmentResponse = await fetch('/api/enrollments/me', {
          credentials: 'include'
        });
        if (!enrollmentResponse.ok) {
          throw new Error('Failed to fetch enrollments');
        }
        const enrollmentData = await enrollmentResponse.json();
        
        // Find the specific enrollment for this course
        const userEnrollment = enrollmentData.enrollments.find(
          enrollment => enrollment.courseId._id === courseId
        );
        
        if (!userEnrollment) {
          // If user is not enrolled, redirect to course detail page
          alert('You must be enrolled in this course to view its content');
          navigate(`/courses/${courseId}`);
          return;
        }
        
        setEnrollment(userEnrollment);
      } catch (error) {
        console.error('Error fetching course content:', error);
        alert('Error loading course content');
      } finally {
        setLoading(false);
      }
    };

    if (user && courseId) {
      fetchData();
    } else {
      navigate('/login');
    }
  }, [user, courseId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Course not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg">No Image Available</span>
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
          <p className="text-gray-700 text-lg mb-6">{course.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded">{course.category}</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded capitalize">{course.difficulty}</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
              ${course.price}
            </span>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
        {course.lessons && course.lessons.length > 0 ? (
          <LessonPlayer course={course} enrollment={enrollment} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No lessons available for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseContent;