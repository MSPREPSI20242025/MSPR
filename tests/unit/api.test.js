// Unit tests for API endpoints
const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

describe('API Unit Tests', () => {
  let app;
  let server;
  
  beforeAll(async () => {
    // Mock the Express app for unit testing
    const express = require('express');
    app = express();
    
    // Add basic middleware
    app.use(express.json());
    
    // Mock API routes
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    
    app.get('/api/covid', (req, res) => {
      const mockData = [
        {
          id: 1,
          country: 'Test Country',
          date: '2024-01-01',
          cases: 100,
          deaths: 10,
          recovered: 80
        }
      ];
      res.status(200).json(mockData);
    });
    
    app.get('/api/mpox', (req, res) => {
      const mockData = [
        {
          id: 1,
          country: 'Test Country',
          date: '2024-01-01',
          cases: 50,
          deaths: 5
        }
      ];
      res.status(200).json(mockData);
    });
    
    // Authentication middleware mock
    app.use('/api/*', (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || token !== 'test-token') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });
    
    server = app.listen(0); // Use random port
  });
  
  afterAll(async () => {
    if (server) {
      server.close();
    }
  });
  
  describe('Health Endpoint', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
  
  describe('COVID API', () => {
    test('should return COVID data with valid token', async () => {
      const response = await request(app)
        .get('/api/covid')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('country');
      expect(response.body[0]).toHaveProperty('cases');
      expect(response.body[0]).toHaveProperty('deaths');
      expect(response.body[0]).toHaveProperty('recovered');
    });
    
    test('should reject request without valid token', async () => {
      await request(app)
        .get('/api/covid')
        .expect(401);
    });
    
    test('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/covid')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
  
  describe('MPOX API', () => {
    test('should return MPOX data with valid token', async () => {
      const response = await request(app)
        .get('/api/mpox')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('country');
      expect(response.body[0]).toHaveProperty('cases');
      expect(response.body[0]).toHaveProperty('deaths');
    });
    
    test('should reject request without valid token', async () => {
      await request(app)
        .get('/api/mpox')
        .expect(401);
    });
  });
  
  describe('Data Validation', () => {
    test('COVID data should have required fields', async () => {
      const response = await request(app)
        .get('/api/covid')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
      
      const data = response.body[0];
      expect(data).toHaveProperty('country');
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('cases');
      expect(data).toHaveProperty('deaths');
      expect(data).toHaveProperty('recovered');
      
      // Validate data types
      expect(typeof data.country).toBe('string');
      expect(typeof data.date).toBe('string');
      expect(typeof data.cases).toBe('number');
      expect(typeof data.deaths).toBe('number');
      expect(typeof data.recovered).toBe('number');
    });
    
    test('MPOX data should have required fields', async () => {
      const response = await request(app)
        .get('/api/mpox')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
      
      const data = response.body[0];
      expect(data).toHaveProperty('country');
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('cases');
      expect(data).toHaveProperty('deaths');
      
      // Validate data types
      expect(typeof data.country).toBe('string');
      expect(typeof data.date).toBe('string');
      expect(typeof data.cases).toBe('number');
      expect(typeof data.deaths).toBe('number');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/nonexistent')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
    
    test('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/covid')
        .set('Authorization', 'Bearer test-token')
        .send('invalid json')
        .expect(400);
    });
  });
});