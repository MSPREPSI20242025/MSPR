// Helper functions for load testing
const fs = require('fs');
const path = require('path');

// Function to select a random country from the predefined list
function selectRandomCountry(context, events, done) {
  const countries = context.vars.countries;
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  context.vars.selectedCountry = randomCountry;
  done();
}

// Function to validate API response structure
function validateCovidResponse(context, events, done) {
  const response = context.vars.response;
  
  if (!response || !Array.isArray(response)) {
    events.emit('customStat', 'validation_error', 1);
    return done();
  }
  
  const requiredFields = ['country', 'date', 'cases', 'deaths', 'recovered'];
  const firstRecord = response[0];
  
  let validationPassed = true;
  requiredFields.forEach(field => {
    if (!(field in firstRecord)) {
      validationPassed = false;
    }
  });
  
  if (validationPassed) {
    events.emit('customStat', 'validation_success', 1);
  } else {
    events.emit('customStat', 'validation_error', 1);
  }
  
  done();
}

// Function to measure database response time
function measureDbResponseTime(context, events, done) {
  const startTime = Date.now();
  
  // This would be called after database query
  const responseTime = Date.now() - startTime;
  events.emit('customStat', 'db_response_time', responseTime);
  
  done();
}

// Function to simulate realistic user behavior
function simulateUserThinkTime(context, events, done) {
  // Simulate realistic user think time between 1-5 seconds
  const thinkTime = Math.random() * 4000 + 1000;
  context.vars.thinkTime = thinkTime;
  
  setTimeout(() => {
    done();
  }, thinkTime);
}

// Function to generate realistic date ranges
function generateDateRange(context, events, done) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - Math.floor(Math.random() * 365)); // Random date within last year
  
  context.vars.startDate = startDate.toISOString().split('T')[0];
  context.vars.endDate = endDate.toISOString().split('T')[0];
  
  done();
}

// Function to log performance metrics
function logPerformanceMetrics(context, events, done) {
  const metrics = {
    timestamp: new Date().toISOString(),
    responseTime: context.vars.responseTime,
    statusCode: context.vars.statusCode,
    endpoint: context.vars.endpoint,
    userAgent: context.vars.userAgent || 'load-test',
    country: context.vars.selectedCountry
  };
  
  // Log to file for analysis
  const logFile = path.join(__dirname, 'performance-metrics.jsonl');
  fs.appendFileSync(logFile, JSON.stringify(metrics) + '\n');
  
  done();
}

// Function to check system health during load test
function checkSystemHealth(context, events, done) {
  // This would typically check metrics like:
  // - CPU usage
  // - Memory usage
  // - Database connections
  // - Response times
  
  const healthMetrics = {
    cpu: Math.random() * 100, // Simulated CPU usage
    memory: Math.random() * 8192, // Simulated memory usage in MB
    connections: Math.floor(Math.random() * 100), // Simulated DB connections
    timestamp: Date.now()
  };
  
  // Emit custom metrics
  events.emit('customStat', 'cpu_usage', healthMetrics.cpu);
  events.emit('customStat', 'memory_usage', healthMetrics.memory);
  events.emit('customStat', 'db_connections', healthMetrics.connections);
  
  // Alert if thresholds are exceeded
  if (healthMetrics.cpu > 80) {
    events.emit('customStat', 'high_cpu_alert', 1);
  }
  
  if (healthMetrics.memory > 6144) { // 6GB threshold
    events.emit('customStat', 'high_memory_alert', 1);
  }
  
  done();
}

// Function to simulate different types of users
function simulateUserType(context, events, done) {
  const userTypes = [
    { type: 'researcher', weight: 30, endpoints: ['/api/covid', '/api/mpox', '/api/statistics'] },
    { type: 'journalist', weight: 25, endpoints: ['/api/covid', '/api/statistics/summary'] },
    { type: 'public', weight: 35, endpoints: ['/health', '/api/covid'] },
    { type: 'admin', weight: 10, endpoints: ['/api/covid', '/api/mpox', '/api/statistics', '/api/admin'] }
  ];
  
  const random = Math.random() * 100;
  let cumulativeWeight = 0;
  
  for (const userType of userTypes) {
    cumulativeWeight += userType.weight;
    if (random <= cumulativeWeight) {
      context.vars.userType = userType.type;
      context.vars.availableEndpoints = userType.endpoints;
      break;
    }
  }
  
  done();
}

// Function to generate realistic payload for POST requests
function generateRealisticPayload(context, events, done) {
  const payloads = {
    covid: {
      country: context.vars.selectedCountry,
      date: new Date().toISOString().split('T')[0],
      cases: Math.floor(Math.random() * 10000),
      deaths: Math.floor(Math.random() * 500),
      recovered: Math.floor(Math.random() * 8000)
    },
    mpox: {
      country: context.vars.selectedCountry,
      date: new Date().toISOString().split('T')[0],
      cases: Math.floor(Math.random() * 1000),
      deaths: Math.floor(Math.random() * 50)
    }
  };
  
  context.vars.payload = JSON.stringify(payloads.covid);
  done();
}

// Function to validate response time SLA
function validateResponseTimeSLA(context, events, done) {
  const responseTime = context.vars.responseTime;
  const endpoint = context.vars.endpoint;
  
  // Define SLA thresholds per endpoint
  const slaThresholds = {
    '/health': 100,
    '/api/covid': 500,
    '/api/mpox': 500,
    '/api/statistics': 1000,
    default: 2000
  };
  
  const threshold = slaThresholds[endpoint] || slaThresholds.default;
  
  if (responseTime > threshold) {
    events.emit('customStat', 'sla_violation', 1);
    events.emit('customStat', `sla_violation_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`, 1);
  } else {
    events.emit('customStat', 'sla_compliance', 1);
  }
  
  done();
}

module.exports = {
  selectRandomCountry,
  validateCovidResponse,
  measureDbResponseTime,
  simulateUserThinkTime,
  generateDateRange,
  logPerformanceMetrics,
  checkSystemHealth,
  simulateUserType,
  generateRealisticPayload,
  validateResponseTimeSLA
};