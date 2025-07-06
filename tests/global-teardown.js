// Global teardown for all tests
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Tearing down test environment...');
  
  // Clean up test database
  try {
    // Stop and remove test database container
    execSync('docker stop test-postgres', { stdio: 'ignore' });
    execSync('docker rm test-postgres', { stdio: 'ignore' });
    console.log('Test database container removed');
  } catch (error) {
    // Container might not exist or already be stopped
    console.log('Test database cleanup completed (container may not have existed)');
  }
  
  // Clean up any other test resources
  try {
    // Clean up test files
    const fs = require('fs');
    const path = require('path');
    
    const testArtifacts = [
      'test-results.json',
      'coverage/tmp',
      '.nyc_output'
    ];
    
    testArtifacts.forEach(artifact => {
      const artifactPath = path.join(process.cwd(), artifact);
      if (fs.existsSync(artifactPath)) {
        fs.rmSync(artifactPath, { recursive: true, force: true });
      }
    });
  } catch (error) {
    console.warn('Warning: Could not clean up all test artifacts:', error.message);
  }
  
  console.log('Test environment teardown completed');
};