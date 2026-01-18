# E-Learning Platform

A complete MERN stack e-learning platform with user authentication, course management, and admin functionality.

## Features

- **Authentication**: JWT-based authentication with httpOnly cookies
- **Course Management**: Browse, create, and manage courses
- **Enrollment System**: Track user progress through courses
- **Admin Dashboard**: Manage users and view analytics
- **Responsive UI**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies

## Project Structure

```
e-learning-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment configs
│   │   ├── models/          # Data models (User, Course, Enrollment)
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication middleware
│   │   └── app.js           # Main application entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── contexts/        # React Context providers
    │   ├── pages/           # Page components
    │   ├── App.jsx          # Main application component
    │   └── main.jsx         # Application entry point
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `FRONTEND_URL`: URL of your frontend (e.g., http://localhost:5173)

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a course (admin only)
- `PUT /api/courses/:id` - Update a course (admin only)
- `DELETE /api/courses/:id` - Delete a course (admin only)

### Enrollments
- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments/me` - Get user's enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/reports` - Get admin reports (admin only)

## Environment Variables

Both backend and frontend applications require certain environment variables to work correctly. See `.env.example` files in respective directories for reference.

## Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Deployment

### Backend (to Render)
1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the root directory to `/backend`
4. Add environment variables in the Render dashboard
5. Deploy!

### Frontend (to Vercel)
1. Create a new project on Vercel
2. Connect to your GitHub repository
3. Set the framework preset to Vite
4. Set build command to `npm run build`
5. Set output directory to `dist`
6. Deploy!

## Testing

### Frontend Tests

```bash
# Run frontend tests
npm test
```

### Backend Tests

```bash
# Run backend tests
npm test
```

## Data Models

### User
```javascript
{
  _id,
  name,
  email,
  passwordHash,
  role: 'user' | 'admin',
  createdAt
}
```

### Course
```javascript
{
  _id,
  title,
  slug,
  description,
  price,
  category,
  difficulty,
  thumbnailUrl,
  lessons: [
    { title, contentHtml, videoUrl?, order }
  ],
  createdAt
}
```

### Enrollment
```javascript
{
  _id,
  userId,
  courseId,
  progress: { lessonId: Boolean },
  enrolledAt
}
```

### Review
```javascript
{
  _id,
  userId,
  courseId,
  rating: Number (1-5),
  comment: String,
  createdAt
}
```

## Additional Features

- **Course Reviews**: Users can submit reviews and ratings for courses
- **Pagination**: Course listing includes pagination for better UX
- **Lesson Player**: Interactive video/content player with progress tracking
- **Admin Panel**: Comprehensive admin interface with course/user management
- **Progress Tracking**: Track completion status of individual lessons
- **Responsive Design**: Works seamlessly across devices
- **Secure Authentication**: JWT tokens in httpOnly cookies

## Security Considerations

- Passwords are securely hashed with bcrypt
- JWT tokens are stored in httpOnly cookies to prevent XSS attacks
- Input validation is implemented on both client and server sides
- CORS is configured to allow only trusted origins
- Role-based access control prevents unauthorized access

## Development Notes

- The application follows REST API conventions
- The frontend uses React Context for state management
- Tailwind CSS is used for styling
- Admin routes are protected with role-based access control
- The application supports course reviews and ratings
- Progress tracking is implemented for course completion

## Future Enhancements

- Payment integration for paid courses
- Video streaming capabilities
- Advanced analytics dashboard
- Course recommendation system
- Push notifications
- Multi-language support
- Certificate generation
- Instructor dashboard
- Quiz functionality
- Social sharing features