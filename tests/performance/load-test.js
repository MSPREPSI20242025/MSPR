// Performance and load testing with Artillery.js configuration
module.exports = {
  config: {
    target: process.env.TARGET_URL || 'http://localhost:3001',
    phases: [
      // Warm-up phase
      {
        duration: 60,
        arrivalRate: 5,
        name: 'Warm-up'
      },
      // Ramp-up phase
      {
        duration: 300,
        arrivalRate: 5,
        rampTo: 50,
        name: 'Ramp-up load'
      },
      // Sustained load
      {
        duration: 600,
        arrivalRate: 50,
        name: 'Sustained load'
      },
      // Peak load
      {
        duration: 300,
        arrivalRate: 50,
        rampTo: 100,
        name: 'Peak load'
      },
      // Cool down
      {
        duration: 120,
        arrivalRate: 100,
        rampTo: 0,
        name: 'Cool down'
      }
    ],
    defaults: {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    },
    variables: {
      countries: [
        'United States',
        'United Kingdom',
        'France',
        'Germany',
        'Italy',
        'Spain',
        'Canada',
        'Australia',
        'Japan',
        'Brazil'
      ]
    },
    processor: './load-test-functions.js'
  },
  scenarios: [
    // API endpoint tests
    {
      name: 'API Health Check',
      weight: 10,
      flow: [
        {
          get: {
            url: '/health',
            expect: [
              { statusCode: 200 },
              { hasProperty: 'status' }
            ]
          }
        }
      ]
    },
    {
      name: 'COVID Data API',
      weight: 40,
      flow: [
        {
          get: {
            url: '/api/covid',
            expect: [
              { statusCode: 200 },
              { contentType: 'json' }
            ],
            capture: [
              {
                json: '$[0].country',
                as: 'firstCountry'
              }
            ]
          }
        },
        {
          think: 2
        },
        {
          get: {
            url: '/api/covid?country={{ firstCountry }}',
            expect: [
              { statusCode: 200 }
            ]
          }
        }
      ]
    },
    {
      name: 'MPOX Data API',
      weight: 30,
      flow: [
        {
          get: {
            url: '/api/mpox',
            expect: [
              { statusCode: 200 },
              { contentType: 'json' }
            ]
          }
        },
        {
          think: 1
        },
        {
          get: {
            url: '/api/mpox/statistics',
            expect: [
              { statusCode: 200 }
            ]
          }
        }
      ]
    },
    {
      name: 'Mixed API Usage',
      weight: 20,
      flow: [
        {
          function: 'selectRandomCountry'
        },
        {
          get: {
            url: '/api/covid?country={{ selectedCountry }}',
            expect: [
              { statusCode: 200 }
            ]
          }
        },
        {
          think: 1
        },
        {
          get: {
            url: '/api/mpox?country={{ selectedCountry }}',
            expect: [
              { statusCode: 200 }
            ]
          }
        },
        {
          think: 2
        },
        {
          get: {
            url: '/api/statistics/compare?countries={{ selectedCountry }}',
            expect: [
              { statusCode: 200 }
            ]
          }
        }
      ]
    }
  ]
};

// Performance thresholds
const performanceThresholds = {
  // Response time thresholds (in milliseconds)
  responseTime: {
    p95: 500,  // 95th percentile should be under 500ms
    p99: 1000, // 99th percentile should be under 1000ms
    max: 2000  // Max response time should be under 2000ms
  },
  
  // Error rate thresholds
  errorRate: {
    max: 0.01 // Maximum 1% error rate
  },
  
  // Throughput thresholds
  throughput: {
    min: 100 // Minimum 100 requests per second
  }
};

// Custom metrics
const customMetrics = {
  // Database query performance
  dbQueryTime: {
    aggregation: 'avg',
    unit: 'ms'
  },
  
  // Cache hit rate
  cacheHitRate: {
    aggregation: 'rate',
    unit: 'percent'
  },
  
  // Memory usage
  memoryUsage: {
    aggregation: 'avg',
    unit: 'MB'
  }
};

module.exports.performanceThresholds = performanceThresholds;
module.exports.customMetrics = customMetrics;