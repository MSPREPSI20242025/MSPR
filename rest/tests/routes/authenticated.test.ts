import request from 'supertest';
import express from 'express';
import { mockPrismaClient, mockCovidData, mockMpoxData, mockStatsData, resetMocks } from '../setup';

// Mock environment variables
process.env.API_TOKEN = 'test-api-token';

// Mock Prisma Client before importing routes
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

import authenticatedRoutes from '../../src/routes/authenticated';

const app = express();
app.use(express.json());
app.use('/api', authenticatedRoutes);

const validToken = 'Bearer test-api-token';
const invalidToken = 'Bearer invalid-token';

describe('Authenticated Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without authorization header', async () => {
      const response = await request(app)
        .get('/api/covid/data')
        .expect(401);

      expect(response.body).toEqual({ error: 'Access denied. No token provided.' });
    });

    it('should reject requests with invalid token format', async () => {
      const response = await request(app)
        .get('/api/covid/data')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toEqual({ error: 'Access denied. No token provided.' });
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/covid/data')
        .set('Authorization', invalidToken)
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid token.' });
    });
  });

  describe('GET /api/covid/data', () => {
    it('should return COVID data with valid token', async () => {
      mockPrismaClient.covidData.findMany.mockResolvedValue(mockCovidData);

      const response = await request(app)
        .get('/api/covid/data')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual(mockCovidData);
      expect(mockPrismaClient.covidData.findMany).toHaveBeenCalledWith({
        where: undefined,
        take: 100,
        orderBy: { date: 'desc' },
      });
    });

    it('should filter by country when provided', async () => {
      mockPrismaClient.covidData.findMany.mockResolvedValue(mockCovidData);

      const response = await request(app)
        .get('/api/covid/data?country=France&limit=50')
        .set('Authorization', validToken)
        .expect(200);

      expect(mockPrismaClient.covidData.findMany).toHaveBeenCalledWith({
        where: { country: 'France' },
        take: 50,
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('GET /api/mpox/data', () => {
    it('should return MPOX data with valid token', async () => {
      mockPrismaClient.mpoxData.findMany.mockResolvedValue(mockMpoxData);

      const response = await request(app)
        .get('/api/mpox/data')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual(mockMpoxData);
    });
  });

  describe('GET /api/stats/summary', () => {
    it('should return aggregated statistics', async () => {
      const covidStats = [{ total_cases: BigInt(5000000), total_deaths: BigInt(50000) }];
      const mpoxStats = [{ total_cases: BigInt(25000), total_deaths: BigInt(250) }];

      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce(covidStats)
        .mockResolvedValueOnce(mpoxStats);

      const response = await request(app)
        .get('/api/stats/summary')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body.covid.total_cases).toBe(5000000);
      expect(response.body.covid.total_deaths).toBe(50000);
      expect(response.body.mpox.total_cases).toBe(25000);
      expect(response.body.mpox.total_deaths).toBe(250);
    });
  });

  describe('POST /api/covid/data', () => {
    const newCovidData = {
      date: '2024-01-03',
      country: 'Germany',
      total_cases: 2000,
      new_cases: 100,
      total_deaths: 200,
      new_deaths: 10,
    };

    it('should create new COVID data entry', async () => {
      mockPrismaClient.covidData.create.mockResolvedValue(newCovidData);

      const response = await request(app)
        .post('/api/covid/data')
        .set('Authorization', validToken)
        .send(newCovidData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Data added successfully',
      });

      expect(mockPrismaClient.covidData.create).toHaveBeenCalledWith({
        data: {
          date: '2024-01-03',
          country: 'Germany',
          total_cases: 2000,
          new_cases: 100,
          total_deaths: 200,
          new_deaths: 10,
        },
      });
    });

    it('should handle creation errors', async () => {
      const errorMessage = 'Validation failed';
      mockPrismaClient.covidData.create.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/covid/data')
        .set('Authorization', validToken)
        .send(newCovidData)
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('POST /api/mpox/data', () => {
    const newMpoxData = {
      date: '2024-01-03',
      country: 'Canada',
      total_cases: 300,
      new_cases: 15,
      total_deaths: 30,
      new_deaths: 1,
    };

    it('should create new MPOX data entry', async () => {
      mockPrismaClient.mpoxData.create.mockResolvedValue(newMpoxData);

      const response = await request(app)
        .post('/api/mpox/data')
        .set('Authorization', validToken)
        .send(newMpoxData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Data added successfully',
      });
    });
  });

  describe('PUT /api/covid/data/:id', () => {
    const updateData = {
      date: '2024-01-04',
      country: 'France',
      total_cases: 1100,
      new_cases: 50,
      total_deaths: 110,
      new_deaths: 5,
    };

    it('should update existing COVID data', async () => {
      mockPrismaClient.covidData.update.mockResolvedValue(updateData);

      const response = await request(app)
        .put('/api/covid/data/1')
        .set('Authorization', validToken)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Data updated successfully',
      });

      expect(mockPrismaClient.covidData.update).toHaveBeenCalledWith({
        where: { index: 1 },
        data: {
          date: '2024-01-04',
          country: 'France',
          total_cases: 1100,
          new_cases: 50,
          total_deaths: 110,
          new_deaths: 5,
        },
      });
    });

    it('should handle update errors', async () => {
      const errorMessage = 'Record not found';
      mockPrismaClient.covidData.update.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .put('/api/covid/data/999')
        .set('Authorization', validToken)
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('PUT /api/mpox/data/:id', () => {
    const updateData = {
      date: '2024-01-04',
      country: 'USA',
      total_cases: 550,
      new_cases: 25,
      total_deaths: 55,
      new_deaths: 3,
    };

    it('should update existing MPOX data', async () => {
      mockPrismaClient.mpoxData.update.mockResolvedValue(updateData);

      const response = await request(app)
        .put('/api/mpox/data/1')
        .set('Authorization', validToken)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Data updated successfully',
      });
    });
  });

  describe('DELETE /api/covid/data/:id', () => {
    it('should delete COVID data entry', async () => {
      mockPrismaClient.covidData.delete.mockResolvedValue(mockCovidData[0]);

      const response = await request(app)
        .delete('/api/covid/data/1')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Data deleted successfully',
      });

      expect(mockPrismaClient.covidData.delete).toHaveBeenCalledWith({
        where: { index: 1 },
      });
    });

    it('should handle deletion errors', async () => {
      const errorMessage = 'Record not found';
      mockPrismaClient.covidData.delete.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .delete('/api/covid/data/999')
        .set('Authorization', validToken)
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('DELETE /api/mpox/data/:id', () => {
    it('should delete MPOX data entry', async () => {
      mockPrismaClient.mpoxData.delete.mockResolvedValue(mockMpoxData[0]);

      const response = await request(app)
        .delete('/api/mpox/data/1')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Data deleted successfully',
      });
    });
  });
});