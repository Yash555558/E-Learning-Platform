import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LessonPlayer = ({ course, initialLessonIndex = 0 }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const navigate = useNavigate();

  const currentLesson = course.lessons[currentLessonIndex];

  const handleMarkComplete = async () => {
    const updatedCompleted = new Set(completedLessons);
    updatedCompleted.add(currentLessonIndex);
    setCompletedLessons(updatedCompleted);

    // Update progress on backend
    try {
      // Assuming enrollment ID is available from context or props
      // This would need to be updated with actual enrollment ID
      // await updateProgress(enrollmentId, course.lessons[currentLessonIndex]._id, true);
    } catch (error) {
      console.error('Error updating progress:', error);
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
            <video 
              src={currentLesson.videoUrl} 
              controls 
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
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