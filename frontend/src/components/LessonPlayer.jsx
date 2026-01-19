import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LessonPlayer = ({ course, enrollment, initialLessonIndex = 0 }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const navigate = useNavigate();

  const currentLesson = course.lessons[currentLessonIndex];

  // Initialize completed lessons based on enrollment progress
  useEffect(() => {
    if (enrollment && enrollment.progress) {
      const completedSet = new Set();
      Object.keys(enrollment.progress).forEach(lessonId => {
        if (enrollment.progress[lessonId]) {
          // Find the index of this lesson in the course
          const lessonIndex = course.lessons.findIndex(lesson => lesson._id === lessonId);
          if (lessonIndex !== -1) {
            completedSet.add(lessonIndex);
          }
        }
      });
      setCompletedLessons(completedSet);
    }
  }, [enrollment, course.lessons]);

  const handleMarkComplete = async () => {
    const updatedCompleted = new Set(completedLessons);
    updatedCompleted.add(currentLessonIndex);
    setCompletedLessons(updatedCompleted);

    // Update progress on backend
    try {
      if (enrollment && enrollment._id) {
        const lessonId = course.lessons[currentLessonIndex]._id;
        const response = await fetch(`/api/enrollments/${enrollment._id}/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            lessonId,
            done: true
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update progress');
        }

        // Update enrollment state in parent component if needed
        console.log('Progress updated successfully');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Rollback UI if API call fails
      updatedCompleted.delete(currentLessonIndex);
      setCompletedLessons(updatedCompleted);
      alert('Error updating progress: ' + error.message);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const isCompleted = completedLessons.has(currentLessonIndex);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
        <span className="text-gray-600">
          {currentLessonIndex + 1} of {course.lessons.length}
        </span>
      </div>

      <div className="mb-6">
        {currentLesson.videoUrl ? (
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            <iframe
              src={`${currentLesson.videoUrl}?autoplay=0&modestbranding=1&rel=0`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={currentLesson.title}
              sandbox="allow-scripts allow-same-origin allow-popups"
            ></iframe>
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-md text-center">
            <p className="text-gray-600">No video available for this lesson</p>
          </div>
        )}
      </div>

      <div className="prose max-w-none mb-6">
        <div dangerouslySetInnerHTML={{ __html: currentLesson.contentHtml }} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentLessonIndex === 0}
          className={`px-4 py-2 rounded-md ${
            currentLessonIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous
        </button>

        {!isCompleted && (
          <button
            onClick={handleMarkComplete}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Mark Complete
          </button>
        )}

        {isCompleted && (
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
            ✓ Completed
          </span>
        )}

        <button
          onClick={handleNext}
          disabled={currentLessonIndex === course.lessons.length - 1}
          className={`px-4 py-2 rounded-md ml-auto ${
            currentLessonIndex === course.lessons.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Course Outline</h3>
        <ul className="space-y-2">
          {course.lessons.map((lesson, index) => (
            <li key={index}>
              <button
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full text-left p-2 rounded-md ${
                  currentLessonIndex === index
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className={`mr-2 ${completedLessons.has(index) ? 'text-green-500' : 'text-gray-400'}`}>
                    {completedLessons.has(index) ? '✓' : index + 1}
                  </span>
                  <span className={currentLessonIndex === index ? 'font-semibold' : ''}>
                    {lesson.title}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LessonPlayer;