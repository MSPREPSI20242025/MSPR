// Integration tests for database operations
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

describe('Database Integration Tests', () => {
  let prisma;
  
  beforeAll(async () => {
    // Initialize Prisma client for testing
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_db'
        }
      }
    });
    
    await prisma.$connect();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.mpoxData.deleteMany({
      where: { country: { contains: 'Test' } }
    });
    await prisma.covidData.deleteMany({
      where: { country: { contains: 'Test' } }
    });
  });
  
  describe('COVID Data Operations', () => {
    test('should create COVID data record', async () => {
      const testData = {
        country: 'Test Country COVID',
        date: new Date('2024-01-01'),
        cases: 100,
        deaths: 10,
        recovered: 80
      };
      
      const created = await prisma.covidData.create({
        data: testData
      });
      
      expect(created).toHaveProperty('id');
      expect(created.country).toBe(testData.country);
      expect(created.cases).toBe(testData.cases);
      expect(created.deaths).toBe(testData.deaths);
      expect(created.recovered).toBe(testData.recovered);
    });
    
    test('should retrieve COVID data by country', async () => {
      // Create test data
      const testData = {
        country: 'Test Country Query',
        date: new Date('2024-01-01'),
        cases: 150,
        deaths: 15,
        recovered: 120
      };
      
      await prisma.covidData.create({ data: testData });
      
      // Query the data
      const results = await prisma.covidData.findMany({
        where: { country: testData.country }
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].country).toBe(testData.country);
      expect(results[0].cases).toBe(testData.cases);
    });
    
    test('should update COVID data record', async () => {
      // Create initial data
      const testData = {
        country: 'Test Country Update',
        date: new Date('2024-01-01'),
        cases: 100,
        deaths: 10,
        recovered: 80
      };
      
      const created = await prisma.covidData.create({ data: testData });
      
      // Update the data
      const updated = await prisma.covidData.update({
        where: { id: created.id },
        data: { cases: 200, recovered: 160 }
      });
      
      expect(updated.cases).toBe(200);
      expect(updated.recovered).toBe(160);
      expect(updated.deaths).toBe(10); // Should remain unchanged
    });
    
    test('should delete COVID data record', async () => {
      // Create test data
      const testData = {
        country: 'Test Country Delete',
        date: new Date('2024-01-01'),
        cases: 100,
        deaths: 10,
        recovered: 80
      };
      
      const created = await prisma.covidData.create({ data: testData });
      
      // Delete the data
      await prisma.covidData.delete({
        where: { id: created.id }
      });
      
      // Verify deletion
      const found = await prisma.covidData.findUnique({
        where: { id: created.id }
      });
      
      expect(found).toBeNull();
    });
  });
  
  describe('MPOX Data Operations', () => {
    test('should create MPOX data record', async () => {
      const testData = {
        country: 'Test Country MPOX',
        date: new Date('2024-01-01'),
        cases: 50,
        deaths: 5
      };
      
      const created = await prisma.mpoxData.create({
        data: testData
      });
      
      expect(created).toHaveProperty('id');
      expect(created.country).toBe(testData.country);
      expect(created.cases).toBe(testData.cases);
      expect(created.deaths).toBe(testData.deaths);
    });
    
    test('should retrieve MPOX data by date range', async () => {
      // Create test data
      const testData = [
        {
          country: 'Test Country Range',
          date: new Date('2024-01-01'),
          cases: 50,
          deaths: 5
        },
        {
          country: 'Test Country Range',
          date: new Date('2024-01-15'),
          cases: 60,
          deaths: 6
        },
        {
          country: 'Test Country Range',
          date: new Date('2024-02-01'),
          cases: 70,
          deaths: 7
        }
      ];
      
      await prisma.mpoxData.createMany({ data: testData });
      
      // Query data for January 2024
      const results = await prisma.mpoxData.findMany({
        where: {
          country: 'Test Country Range',
          date: {
            gte: new Date('2024-01-01'),
            lt: new Date('2024-02-01')
          }
        },
        orderBy: { date: 'asc' }
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].cases).toBe(50);
      expect(results[1].cases).toBe(60);
    });
  });
  
  describe('Data Aggregation', () => {
    test('should calculate total COVID cases by country', async () => {
      // Create test data for aggregation
      const testData = [
        {
          country: 'Test Aggregation Country',
          date: new Date('2024-01-01'),
          cases: 100,
          deaths: 10,
          recovered: 80
        },
        {
          country: 'Test Aggregation Country',
          date: new Date('2024-01-02'),
          cases: 150,
          deaths: 15,
          recovered: 120
        },
        {
          country: 'Test Aggregation Country',
          date: new Date('2024-01-03'),
          cases: 200,
          deaths: 20,
          recovered: 160
        }
      ];
      
      await prisma.covidData.createMany({ data: testData });
      
      // Aggregate the data
      const aggregation = await prisma.covidData.aggregate({
        where: { country: 'Test Aggregation Country' },
        _sum: {
          cases: true,
          deaths: true,
          recovered: true
        },
        _avg: {
          cases: true
        },
        _max: {
          cases: true
        }
      });
      
      expect(aggregation._sum.cases).toBe(450);
      expect(aggregation._sum.deaths).toBe(45);
      expect(aggregation._sum.recovered).toBe(360);
      expect(aggregation._avg.cases).toBe(150);
      expect(aggregation._max.cases).toBe(200);
    });
  });
  
  describe('Database Constraints', () => {
    test('should enforce required fields for COVID data', async () => {
      const invalidData = {
        // Missing required fields
        date: new Date('2024-01-01'),
        cases: 100
      };
      
      await expect(
        prisma.covidData.create({ data: invalidData })
      ).rejects.toThrow();
    });
    
    test('should enforce data types', async () => {
      const invalidData = {
        country: 'Test Country Types',
        date: new Date('2024-01-01'),
        cases: 'not a number', // Invalid type
        deaths: 10,
        recovered: 80
      };
      
      await expect(
        prisma.covidData.create({ data: invalidData })
      ).rejects.toThrow();
    });
  });
  
  describe('Performance Tests', () => {
    test('should handle bulk insert efficiently', async () => {
      const bulkData = [];
      for (let i = 0; i < 1000; i++) {
        bulkData.push({
          country: `Test Bulk Country ${i % 10}`,
          date: new Date(`2024-01-${(i % 30) + 1}`),
          cases: Math.floor(Math.random() * 1000),
          deaths: Math.floor(Math.random() * 100),
          recovered: Math.floor(Math.random() * 800)
        });
      }
      
      const startTime = Date.now();
      await prisma.covidData.createMany({ data: bulkData });
      const endTime = Date.now();
      
      const insertTime = endTime - startTime;
      expect(insertTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify data was inserted
      const count = await prisma.covidData.count({
        where: { country: { contains: 'Test Bulk' } }
      });
      expect(count).toBe(1000);
      
      // Clean up
      await prisma.covidData.deleteMany({
        where: { country: { contains: 'Test Bulk' } }
      });
    });
  });
});