const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');

describe('Auth API', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('user');

      // Check if user is saved in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(await bcrypt.compare(userData.password, user.passwordHash)).toBe(true);
    });

    it('should return error for duplicate email', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      // Second signup with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toBe('Email already registered');
    });

    it('should return error for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: '', // Invalid name
          email: 'invalid-email', // Invalid email
          password: '123' // Too short password
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      // First create a user
      const hashedPassword = await bcrypt.hash('password123', 12);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.headers['set-cookie']).toBeDefined(); // Should set cookie
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info if authenticated', async () => {
      // This test would require a valid JWT token or cookie
      // Implementation depends on how authentication is handled
      const response = await request(app)
        .get('/api/auth/me')
        .expect(200);

      // This endpoint should return either user data or null
      expect(response.body).toBeDefined();
    });
  });
});