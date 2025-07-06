// Global setup for all tests
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Setting up test environment...');
  
  // Start test database if needed
  try {
    // Check if test database is available
    execSync('pg_isready -h localhost -p 5432', { stdio: 'ignore' });
    console.log('Test database is available');
  } catch (error) {
    console.log('Test database not available, starting with Docker...');
    
    // Start test database with Docker
    execSync(`
      docker run -d --name test-postgres \
        -e POSTGRES_USER=test_user \
        -e POSTGRES_PASSWORD=test_password \
        -e POSTGRES_DB=test_db \
        -p 5432:5432 \
        postgres:16-alpine
    `, { stdio: 'inherit' });
    
    // Wait for database to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        execSync('pg_isready -h localhost -p 5432', { stdio: 'ignore' });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('Test database failed to start');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Run database migrations
  try {
    process.chdir('./rest');
    execSync('pnpm dlx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/test_db' 
      }
    });
    process.chdir('..');
    console.log('Database migrations completed');
  } catch (error) {
    console.error('Failed to run migrations:', error.message);
  }
  
  console.log('Test environment setup completed');
};