# E-Learning Platform

A comprehensive MERN stack e-learning platform featuring user authentication, course management, enrollment system, and admin controls. Built as a complete product-level application suitable for portfolios demonstrating system design, security, and real-world features.

## 🚀 Features

### Public Features
- **Landing Page**: Marketing-focused homepage with course highlights
- **Course Catalog**: Browse courses with advanced filtering (category, difficulty, price, search)
- **Course Detail Pages**: Detailed course information with syllabus and instructor details
- **Responsive Design**: Mobile-first approach with responsive UI

### User Features
- **Authentication**: Secure JWT-based signup/login with role-based access
- **User Dashboard**: Personalized dashboard showing enrolled courses and progress tracking
- **Course Enrollment**: Ability to enroll in free or paid courses
- **Progress Tracking**: Track lesson completion and course progress
- **Course Reviews**: Submit and view course ratings and reviews
- **Lesson Player**: Interactive video/content player with navigation and completion tracking

### Admin Features
- **Course Management**: Create, edit, and delete courses with rich content editor
- **User Management**: View and manage all platform users
- **Analytics Dashboard**: View platform metrics (total users, courses, enrollments)
- **Content Management**: Upload course thumbnails and manage course content

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS for utility-first CSS
- **State Management**: React Context API
- **HTTP Client**: Axios for API requests
- **UI Components**: Custom-built reusable components

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies
- **Validation**: express-validator for input validation
- **Security**: bcrypt for password hashing
- **File Upload**: Multer with Cloudinary integration

### Infrastructure
- **Version Control**: Git & GitHub
- **Deployment**: Frontend to Vercel, Backend to Render
- **Environment Management**: dotenv for configuration

## 📁 Project Structure

```
e-learning-platform/
├── backend/
│   ├── __tests__/              # Backend test files
│   ├── src/
│   │   ├── config/             # Database and environment configs
│   │   ├── middleware/         # Authentication and authorization middleware
│   │   ├── models/             # MongoDB schemas (User, Course, Enrollment, Review)
│   │   ├── routes/             # API route definitions
│   │   └── app.js              # Main application entry point
│   ├── server.js               # Server configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React Context providers
│   │   ├── pages/              # Route-specific components
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Entry point
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance or Atlas)
- npm or yarn package manager

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
- `MONGO_URI`: Your MongoDB connection string (Atlas or local)
- `JWT_SECRET`: Secret key for JWT signing (use a strong random string)
- `JWT_EXPIRES_IN`: Token expiration time (e.g., '7d' for 7 days)
- `FRONTEND_URL`: URL of your frontend (e.g., http://localhost:5173)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads

5. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:4000` (or your configured port).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
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
- `VITE_API_BASE_URL`: Base URL for API calls (e.g., http://localhost:4000/api)

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 Authentication Flow

The application uses JWT-based authentication with httpOnly cookies for security:

1. **User Registration**: Passwords are hashed using bcrypt before storing
2. **Login**: JWT token is generated and stored in httpOnly cookie
3. **Protected Routes**: Middleware validates JWT token on each request
4. **Role-Based Access**: Different permissions for 'user' and 'admin' roles
5. **Token Expiration**: Configurable token lifetime with automatic logout

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  role: String ('user' | 'admin', default: 'user'),
  createdAt: Date (default: Date.now)
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (required, unique),
  description: String,
  price: Number (default: 0),
  category: String,
  difficulty: String ('Beginner' | 'Intermediate' | 'Advanced', default: 'Beginner'),
  thumbnailUrl: String,
  lessons: [{
    title: String,
    contentHtml: String,
    videoUrl: String,
    order: Number
  }],
  createdAt: Date (default: Date.now)
}
```

### Enrollment Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  courseId: ObjectId (ref: 'Course', required),
  progress: Map (lessonId: Boolean, default: {}),
  enrolledAt: Date (default: Date.now),
  paymentStatus: String (default: 'pending'),
  paymentId: String,
  paymentDate: Date,
  amountPaid: Number
}
```

### Review Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  courseId: ObjectId (ref: 'Course', required),
  rating: Number (required, 1-5),
  comment: String,
  createdAt: Date (default: Date.now)
}
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Courses
- `GET /api/courses` - Get all courses (with pagination, filtering)
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a course (admin only)
- `PUT /api/courses/:id` - Update a course (admin only)
- `DELETE /api/courses/:id` - Delete a course (admin only)

### Enrollments
- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments/me` - Get user's enrollments
- `PUT /api/enrollments/:id/progress` - Update lesson progress

### Reviews
- `POST /api/reviews` - Submit a course review
- `GET /api/reviews/:courseId` - Get reviews for a course
- `PUT /api/reviews/:id` - Update a review (user's own review)
- `DELETE /api/reviews/:id` - Delete a review (user's own review)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/reports` - Get admin reports (admin only)

### Payments (Simulated)
- `POST /api/payments/create-order` - Create a simulated payment order
- `POST /api/payments/simulate-payment` - Process simulated payment

### File Uploads
- `POST /api/uploads/image` - Upload course thumbnail (admin only)

## 🧪 Testing

### Backend Tests
The project includes backend tests using Jest and Supertest:

```bash
# Run backend tests
cd backend
npm test
```

Current test coverage includes:
- Authentication endpoints (signup, login)
- Input validation
- Error handling

### Frontend Testing Strategy
While no automated tests exist yet, the application follows best practices for testability:
- Component-based architecture
- Separation of concerns
- Predictable state management

## 🔒 Security Features

- **Password Security**: All passwords are hashed using bcrypt with salt rounds
- **JWT Tokens**: Secure JWT implementation with configurable expiration
- **HttpOnly Cookies**: Tokens stored in httpOnly cookies to prevent XSS attacks
- **Input Validation**: Both client-side and server-side validation
- **CORS Configuration**: Properly configured to allow only trusted origins
- **Role-Based Access Control**: Protected routes based on user roles
- **SQL Injection Prevention**: MongoDB with proper query sanitization
- **Rate Limiting**: Built-in Express rate limiting middleware

## 🚀 Deployment

### Backend Deployment (to Render)
1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the root directory to `/backend`
4. Add environment variables in the Render dashboard:
   - MONGO_URI
   - JWT_SECRET
   - FRONTEND_URL
   - Any other required environment variables
5. Set build command to `npm install` and start command to `npm start`
6. Deploy!

### Frontend Deployment (to Vercel)
1. Create a new project on Vercel
2. Connect to your GitHub repository
3. Set the framework preset to Vite
4. Set build command to `npm run build`
5. Set output directory to `dist`
6. Add environment variables:
   - VITE_API_BASE_URL (your deployed backend URL)
7. Deploy!

### Alternative Deployment Options
- **Heroku**: For backend deployment
- **Netlify**: Alternative to Vercel for frontend
- **AWS/GCP**: For more advanced deployments

## 📊 Performance Optimizations

- **Lazy Loading**: Components loaded on-demand
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Cloudinary for image optimization
- **Caching Strategies**: API response caching where appropriate
- **Bundle Size Optimization**: Tree shaking and dead code elimination

## 🐳 Docker Support (Future Enhancement)

While not currently implemented, Docker support would involve:
- Multi-stage builds for optimized images
- Environment-specific configurations
- Database container orchestration
- Reverse proxy setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 🐛 Known Issues & Limitations

1. **Progress Tracking**: Frontend progress updates to backend are not fully implemented in LessonPlayer
2. **Payment System**: Currently uses simulated payments, not real payment gateway
3. **File Uploads**: Relies on Cloudinary for image storage
4. **Real-time Features**: No WebSocket support for real-time updates
5. **Advanced Analytics**: Basic reporting only, no advanced analytics

## 🔮 Future Enhancements

### High Priority
- Real payment gateway integration (Stripe/Razorpay)
- Complete progress tracking implementation
- Enhanced admin analytics dashboard
- Video streaming capabilities (not just YouTube embedding)

### Medium Priority
- Course recommendation system
- Quiz functionality within lessons
- Certificate generation upon course completion
- Push notifications
- Multi-language support

### Low Priority
- Social sharing features
- Instructor dashboard and revenue tracking
- Advanced search with Elasticsearch
- Offline course download capability
- Mobile app development (React Native)

## 📈 Scalability Considerations

- **Database**: MongoDB sharding for horizontal scaling
- **API**: Microservices architecture when needed
- **Static Assets**: CDN for images and static files
- **Load Balancing**: Multiple instances behind load balancer
- **Caching**: Redis for session and response caching
- **Monitoring**: Integration with monitoring tools (New Relic, Datadog)

## 🏆 Project Achievements

This project demonstrates:
- Full-stack development proficiency
- Understanding of modern web development practices
- Security-conscious development
- REST API design and implementation
- Database modeling and relationships
- Frontend state management
- Responsive UI/UX design
- Professional code organization

## 📞 Support

For support or questions about this project:
- Create an issue in the GitHub repository
- Contact through professional channels
- Review the documentation thoroughly before reaching out

## 📄 License

This project is open-source and available under the MIT License.

## 🙏 Acknowledgments

- Thanks to the MERN stack community for excellent resources
- Special mention to the libraries and frameworks used
- Inspiration from various e-learning platforms
- The open-source community for continuous learning opportunities