import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: 0,
    category: '',
    difficulty: 'Beginner',
    thumbnailUrl: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lessons, setLessons] = useState([{ title: '', contentHtml: '', videoUrl: '', order: 0 }]);
  const [loading, setLoading] = useState(true);
  const [editCourseId, setEditCourseId] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes, reportsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/reports', { credentials: 'include' })
      ]);

      const coursesData = await coursesRes.json();
      const usersData = await usersRes.json();
      const reportsData = await reportsRes.json();

      setCourses(coursesData.courses || []);
      setUsers(usersData.users || []);
      setReports(reportsData.reports || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      // Preview the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          thumbnailUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploading(true);
      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      const data = await response.json();
      setUploading(false);
      
      if (data.url) {
        return data.url;
      } else {
        throw new Error('Upload failed: No URL returned');
      }
    } catch (error) {
      setUploading(false);
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
      return null;
    }
  };

  const handleLessonChange = (index, field, value) => {
    const newLessons = [...lessons];
    newLessons[index][field] = value;
    newLessons[index].order = index;
    setLessons(newLessons);
  };

  const isValidYouTubeUrl = (url) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    
    // Handle already embedded URLs
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const addLesson = () => {
    setLessons([...lessons, { 
      title: '', 
      contentHtml: '', 
      videoUrl: '', 
      order: lessons.length 
    }]);
  };

  const removeLesson = (index) => {
    const newLessons = lessons.filter((_, i) => i !== index);
    setLessons(newLessons.map((lesson, i) => ({ ...lesson, order: i })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all lessons have YouTube URLs
    const invalidLessons = lessons.filter(lesson => 
      !lesson.videoUrl || !isValidYouTubeUrl(lesson.videoUrl)
    );
    
    if (invalidLessons.length > 0) {
      alert(`Please provide valid YouTube URLs for all lessons. ${invalidLessons.length} lesson(s) are missing valid video URLs.`);
      return;
    }
    
    try {
      // Upload thumbnail if a new file is selected
      let uploadedThumbnailUrl = formData.thumbnailUrl;
      if (thumbnailFile) {
        uploadedThumbnailUrl = await uploadImage(thumbnailFile);
        if (!uploadedThumbnailUrl) {
          return; // uploadImage already showed error
        }
      }
      
      // Convert YouTube URLs to embed URLs before sending to backend
      const processedLessons = lessons.map(lesson => ({
        ...lesson,
        videoUrl: getYoutubeEmbedUrl(lesson.videoUrl)
      }));
      
      const courseData = {
        ...formData,
        thumbnailUrl: uploadedThumbnailUrl,
        lessons: processedLessons
      };

      let response;
      if (editCourseId) {
        response = await fetch(`/api/courses/${editCourseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(courseData)
        });
      } else {
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(courseData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        
        if (editCourseId) {
          setCourses(courses.map(course => 
            course._id === editCourseId ? result.course : course
          ));
        } else {
          setCourses([...courses, result.course]);
        }
        
        // Reset form
        setFormData({
          title: '',
          slug: '',
          description: '',
          price: 0,
          category: '',
          difficulty: 'Beginner',
          thumbnailUrl: ''
        });
        setThumbnailFile(null);
        setLessons([{ title: '', contentHtml: '', videoUrl: '', order: 0 }]);
        setEditCourseId(null);
        
        alert(editCourseId ? 'Course updated successfully!' : 'Course created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    }
  };

  const handleEditCourse = (course) => {
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: course.price,
      category: course.category,
      difficulty: course.difficulty,
      thumbnailUrl: course.thumbnailUrl
    });
    setLessons(course.lessons || []);
    setEditCourseId(course._id);
    setActiveTab('courses');
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setCourses(courses.filter(course => course._id !== courseId));
        alert('Course deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex flex-wrap gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-t-md ${
            activeTab === 'dashboard' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-t-md ${
            activeTab === 'courses' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Manage Courses
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-t-md ${
            activeTab === 'users' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{reports.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Courses</h3>
            <p className="text-3xl font-bold text-green-600">{reports.totalCourses || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Enrollments</h3>
            <p className="text-3xl font-bold text-purple-600">{reports.totalEnrollments || 0}</p>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">
              {editCourseId ? 'Edit Course' : 'Create New Course'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., introduction-to-react"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Category</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Coding">Coding</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full p-2 border rounded-md"
                    />
                    {uploading && (
                      <div className="mt-2 text-blue-600">Uploading...</div>
                    )}
                    {formData.thumbnailUrl && !uploading && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Preview:</p>
                        <img 
                          src={formData.thumbnailUrl} 
                          alt="Thumbnail Preview" 
                          className="w-32 h-24 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Lessons</h3>
                    <button
                      type="button"
                      onClick={addLesson}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      + Add Lesson
                    </button>
                  </div>
                  
                  {lessons.map((lesson, index) => (
                    <div key={index} className="border p-4 rounded-md mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Lesson {index + 1}</h4>
                        {lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLesson(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title *</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                            required
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Content</label>
                          <textarea
                            value={lesson.contentHtml}
                            onChange={(e) => handleLessonChange(index, 'contentHtml', e.target.value)}
                            rows="3"
                            className="w-full p-2 border rounded-md"
                            placeholder="HTML content for the lesson"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Video URL *</label>
                          <input
                            type="text"
                            value={lesson.videoUrl}
                            onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                            className={`w-full p-2 border rounded-md ${
                              lesson.videoUrl && !isValidYouTubeUrl(lesson.videoUrl) 
                                ? 'border-red-500' 
                                : 'border-gray-300'
                            }`}
                            placeholder="Enter YouTube URL (mandatory)"
                            required
                          />
                          {lesson.videoUrl && !isValidYouTubeUrl(lesson.videoUrl) && (
                            <p className="text-red-500 text-sm mt-1">Please enter a valid YouTube URL</p>
                          )}
                          {lesson.videoUrl && isValidYouTubeUrl(lesson.videoUrl) && (
                            <div className="mt-2">
                              <p className="text-sm text-green-600">✓ Valid YouTube URL</p>
                              <div className="mt-2 aspect-video bg-gray-100 rounded-md overflow-hidden">
                                <iframe
                                  src={`${getYoutubeEmbedUrl(lesson.videoUrl)}?autoplay=0&modestbranding=1&rel=0`}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  title="YouTube Preview"
                                  sandbox="allow-scripts allow-same-origin allow-popups"
                                ></iframe>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editCourseId ? 'Update Course' : 'Create Course'}
                </button>
                
                {editCourseId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditCourseId(null);
                      setFormData({
                        title: '',
                        slug: '',
                        description: '',
                        price: 0,
                        category: '',
                        difficulty: 'Beginner',
                        thumbnailUrl: ''
                      });
                      setLessons([{ title: '', contentHtml: '', videoUrl: '', order: 0 }]);
                    }}
                    className="w-full mt-2 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Existing Courses</h2>
            
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course._id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.category} • {course.difficulty}</p>
                      <p className="text-sm">₹{course.price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {courses.length === 0 && (
                <p className="text-gray-500 text-center py-4">No courses found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Users</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;