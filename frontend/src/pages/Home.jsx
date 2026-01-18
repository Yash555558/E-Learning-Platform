import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Learn Anything, Anytime</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Join thousands of students learning from expert instructors on our platform
          </p>
          <Link 
            to="/courses" 
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">Expert-Led Courses</h3>
              <p className="text-gray-600">Learn from industry professionals with years of experience</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-2">Certification</h3>
              <p className="text-gray-600">Earn certificates to showcase your new skills</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-2">Lifetime Access</h3>
              <p className="text-gray-600">Access course materials forever after purchase</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Start Learning?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/courses" 
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition"
            >
              Explore Courses
            </Link>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg border border-blue-600 hover:bg-blue-50 transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;