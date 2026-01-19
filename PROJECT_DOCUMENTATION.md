# E-Learning Platform - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Features Implemented](#features-implemented)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Payment System](#payment-system)
9. [Setup and Installation](#setup-and-installation)
10. [Development Guidelines](#development-guidelines)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Security Measures](#security-measures)
14. [Troubleshooting](#troubleshooting)

## Project Overview

A comprehensive E-Learning Platform built with MERN stack that allows users to browse courses, enroll in paid courses through secure payment processing, track learning progress, and provides admin controls for course management.

### Key Features:
- User authentication with JWT tokens
- Course browsing with filtering capabilities
- Secure payment processing via Stripe
- Progress tracking for enrolled courses
- Admin panel for course management
- Responsive design for all devices

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Payment Processing**: Stripe.js and @stripe/react-stripe-js
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe API
- **Image Storage**: Cloudinary

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier

## System Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser   │◄──►│  Frontend    │◄──►│   Backend    │
│             │    │  (React/Vite)│    │ (Node/Express)│
└─────────────┘    └──────────────┘    └──────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   MongoDB    │    │  Cloudinary  │
                    │   Atlas      │    │   (Images)   │
                    └──────────────┘    └──────────────┘
```

## Features Implemented

### Public Features
- ✅ Landing page with marketing content
- ✅ Course listing with category and difficulty filters
- ✅ Course detail pages with syllabus overview
- ✅ Responsive design for mobile and desktop

### User Features
- ✅ User registration and login with JWT authentication
- ✅ User dashboard showing enrolled courses
- ✅ Course enrollment functionality
- ✅ Progress tracking for completed lessons
- ✅ Course content viewing (modules/lessons)
- ✅ Profile management

### Admin Features
- ✅ Admin authentication and authorization
- ✅ Course creation, editing, and deletion
- ✅ User management and enrollment tracking
- ✅ Analytics dashboard with enrollment statistics
- ✅ Revenue tracking and reporting

### Payment System
- ✅ Stripe integration for secure payments
- ✅ Test card support for development
- ✅ Payment confirmation and enrollment creation
- ✅ Simulated payment fallback for testing

### Additional Features
- ✅ Cloudinary integration for image uploads
- ✅ Responsive navigation and UI components
- ✅ Error handling and validation
- ✅ Loading states and user feedback
- ✅ Form validation and sanitization

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: String, // 'user' | 'admin'
  createdAt: Date
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,
  description: String,
  price: Number,
  category: String,
  difficulty: String, // 'beginner' | 'intermediate' | 'advanced'
  thumbnailUrl: String,
  lessons: [{
    title: String,
    contentHtml: String,
    videoUrl: String,
    order: Number
  }],
  createdAt: Date
}
```

### Enrollment Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: ObjectId,
  progress: Map, // { lessonId: Boolean }
  enrolledAt: Date,
  paymentStatus: String, // 'pending' | 'completed' | 'failed'
  paymentId: String,
  paymentDate: Date,
  amountPaid: Number
}
```

### Review Model (Optional)
```javascript
{
  userId: ObjectId,
  courseId: ObjectId,
  rating: Number, // 1-5
  comment: String,
  createdAt: Date
}
```

## API Endpoints

### Authentication Routes
```
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me (Protected)
```

### Course Routes
```
GET  /api/courses
GET  /api/courses/:id
POST /api/courses (Admin only)
PUT  /api/courses/:id (Admin only)
DELETE /api/courses/:id (Admin only)
```

### Enrollment Routes
```
POST /api/enrollments (Enroll in course)
GET  /api/enrollments/me (User's enrollments)
PUT  /api/enrollments/:id/progress (Update progress)
```

### Payment Routes
```
POST /api/payments/create-payment-intent
POST /api/payments/create-order
POST /api/payments/simulate-payment
```

### Admin Routes
```
GET /api/users (Admin only)
GET /api/reports (Admin analytics)
```

## Frontend Components

### Core Components
- **Header**: Navigation bar with auth state
- **Footer**: Contact information and copyright
- **CourseCard**: Individual course display component
- **CourseList**: Grid/list view of courses
- **CourseDetail**: Detailed course information page
- **LessonPlayer**: Course content viewer
- **PaymentForm**: Stripe payment processing form
- **Dashboard**: User course management
- **AdminPanel**: Administrative controls
- **PrivateRoute**: Authentication guard for protected routes

### Route Structure
```
/ - Home/Landing page
/courses - Course listing
/courses/:id - Course detail
/login - Login page
/signup - Registration page
/dashboard - User dashboard
/admin - Admin panel (protected)
/course-content/:id - Course content viewer
```

## Payment System

### Stripe Integration
The platform uses Stripe for secure payment processing with the following features:

#### Test Card Details (For Development)
```
Card Number: 4242 4242 4242 4242
Expiry Date: Any future date (e.g. 12/30)
CVC: Any 3 digits (e.g. 123)
ZIP/Postal Code: Any (e.g. 12345)
Name on Card: Any name
```

#### Payment Flow
1. User selects a paid course
2. Clicks "Enroll" button
3. Redirected to payment form
4. Enters card details (test card for development)
5. Stripe processes payment
6. Upon successful payment, user is enrolled in course
7. Enrollment appears in user dashboard

#### Environment Variables Required
```bash
# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend (.env)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Stripe account (for payment processing)
- Cloudinary account (for image storage)

### Backend Setup
```bash
cd backend
npm install
# Create .env file with required variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with required variables
npm run dev
```

### Environment Variables

#### Backend (.env)
```bash
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
CLOUDINARY_URL=your_cloudinary_url
COOKIE_SECURE=false
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_CLOUD_NAME=your_cloudinary_cloud_name
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Development Guidelines

### Coding Standards
- Follow ES6+ JavaScript standards
- Use functional components with hooks in React
- Implement proper error handling
- Maintain consistent code formatting
- Write meaningful commit messages

### Security Best Practices
- Never commit sensitive keys to repository
- Use environment variables for secrets
- Implement proper input validation
- Use HTTPS in production
- Regular security audits

### Performance Optimization
- Implement lazy loading for components
- Optimize images with Cloudinary
- Use efficient database queries
- Implement caching strategies
- Minimize bundle size

## Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### Test Coverage Areas
- Component rendering and functionality
- API endpoint responses
- Authentication flows
- Payment processing
- Error handling scenarios

## Deployment

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings
4. Deploy automatically on pushes to main branch

### Backend Deployment (Render/Heroku)
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Configure build and start scripts
5. Deploy application

### Database Deployment
- Use MongoDB Atlas for production database
- Configure IP whitelisting
- Set up database indexes
- Monitor performance and usage

## Security Measures

### Authentication Security
- JWT tokens with expiration
- Password hashing with bcrypt
- Secure cookie storage
- Role-based access control

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS attack prevention
- CSRF protection

### Payment Security
- PCI DSS compliant Stripe integration
- Secure transmission of payment data
- Tokenization of sensitive information
- Regular security updates

## Troubleshooting

### Common Issues

#### Blank Screen on Frontend
- Check browser console for errors
- Verify environment variables are loaded
- Ensure development servers are running
- Clear browser cache and restart

#### Payment Processing Issues
- Verify Stripe keys are correctly configured
- Check network connectivity to Stripe API
- Ensure test mode is enabled for development
- Review Stripe dashboard for error logs

#### Database Connection Problems
- Verify MongoDB Atlas connection string
- Check IP whitelisting settings
- Ensure database is not paused due to inactivity
- Review connection pool settings

#### Authentication Failures
- Check JWT secret configuration
- Verify token expiration settings
- Review cookie security settings
- Test with different browsers/devices

### Debugging Tips
1. Use browser developer tools extensively
2. Check server logs for error messages
3. Enable detailed logging in development
4. Use Postman for API endpoint testing
5. Implement proper error boundaries in React

## Future Enhancements

### Planned Features
- Course completion certificates
- Quiz and assessment system
- Discussion forums
- Mobile application
- Video streaming integration
- Recommendation engine
- Social sharing features
- Multi-language support

### Technical Improvements
- Implement Redis for caching
- Add WebSocket support for real-time features
- Implement microservices architecture
- Add comprehensive analytics
- Improve accessibility compliance
- Implement progressive web app features

---

*This documentation provides a comprehensive overview of the E-Learning Platform project. For specific implementation details, refer to the source code and inline comments.*