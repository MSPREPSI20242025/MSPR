import request from 'supertest';
import express from 'express';
import { mockPrismaClient, mockCovidData, mockMpoxData, resetMocks } from '../setup';

// Mock Prisma Client before importing routes
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

import publicRoutes from '../../src/routes/public';

const app = express();
app.use(express.json());
app.use('/api', publicRoutes);

describe('Public Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('GET /api/covid/public/latest', () => {
    it('should return latest COVID data', async () => {
      mockPrismaClient.covidData.findMany.mockResolvedValue(mockCovidData);

      const response = await request(app)
        .get('/api/covid/public/latest')
        .expect(200);

      expect(response.body).toEqual(mockCovidData);
      expect(mockPrismaClient.covidData.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { date: 'desc' },
      });
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      mockPrismaClient.covidData.findMany.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/covid/public/latest')
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('GET /api/mpox/public/summary', () => {
    it('should return MPOX summary data', async () => {
      const mockSummary = [
        { country: 'USA', latest_cases: BigInt(1000) },
        { country: 'France', latest_cases: BigInt(500) },
      ];
      
      mockPrismaClient.$queryRaw.mockResolvedValue(mockSummary);

      const response = await request(app)
        .get('/api/mpox/public/summary')
        .expect(200);

      // Check that BigInt was transformed to number
      expect(response.body[0].latest_cases).toBe(1000);
      expect(response.body[1].latest_cases).toBe(500);
    });

    it('should handle database query errors', async () => {
      const errorMessage = 'Query failed';
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/mpox/public/summary')
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('GET /api/covid/public/country/:country', () => {
    it('should return COVID data for specific country', async () => {
      const country = 'France';
      mockPrismaClient.covidData.findMany.mockResolvedValue(mockCovidData);

      const response = await request(app)
        .get(`/api/covid/public/country/${country}`)
        .expect(200);

      expect(response.body).toEqual(mockCovidData);
      expect(mockPrismaClient.covidData.findMany).toHaveBeenCalledWith({
        where: { country },
        orderBy: { date: 'desc' },
        take: 30,
      });
    });

    it('should handle country not found', async () => {
      const country = 'NonExistentCountry';
      mockPrismaClient.covidData.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/covid/public/country/${country}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/covid/public/totals', () => {
    it('should return global COVID totals', async () => {
      const mockLatestDate = { date: new Date('2024-01-01') };
      const mockTotals = [{ total_cases: BigInt(5000000), total_deaths: BigInt(50000) }];

      mockPrismaClient.covidData.findFirst.mockResolvedValue(mockLatestDate);
      mockPrismaClient.$queryRaw.mockResolvedValue(mockTotals);

      const response = await request(app)
        .get('/api/covid/public/totals')
        .expect(200);

      expect(response.body.total_cases).toBe(5000000);
      expect(response.body.total_deaths).toBe(50000);
    });

    it('should handle no data case', async () => {
      mockPrismaClient.covidData.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/covid/public/totals')
        .expect(200);

      expect(response.body).toEqual({
        total_cases: 0,
        total_deaths: 0,
        total_recovered: 0,
      });
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database error';
      mockPrismaClient.covidData.findFirst.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/covid/public/totals')
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });
});