import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await axios.post('/api/enrollments', { courseId: course._id });
      setEnrolled(true);
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.response?.data?.message || 'Error enrolling in course');
    }
  };

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
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <span className="bg-blue-100 text-blue-800 text-xl font-bold px-4 py-2 rounded">
              ${course.price}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded">{course.category}</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded capitalize">{course.difficulty}</span>
          </div>
          
          <p className="text-gray-700 text-lg mb-6">{course.description}</p>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <div className="space-y-4">
              {course.lessons && course.lessons.map((lesson, index) => (
                <div key={index} className="flex items-start p-4 border border-gray-200 rounded-md">
                  <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold">{lesson.title}</h3>
                    <p className="text-gray-600 mt-1">{lesson.contentHtml}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            {user ? (
              <button
                onClick={handleEnroll}
                disabled={enrolled}
                className={`${
                  enrolled 
                    ? 'bg-green-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-bold py-3 px-6 rounded-md transition`}
              >
                {enrolled ? 'Enrolled' : 'Enroll Now'}
              </button>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Log in to enroll in this course</p>
                <a 
                  href="/login" 
                  className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md inline-block hover:bg-blue-700 transition"
                >
                  Login to Enroll
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;