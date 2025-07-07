// Basic test to verify Jest setup and environment
describe('Basic Test Setup', () => {
  it('should run basic Jest test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have correct test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should be able to import Node.js modules', () => {
    const fs = require('fs');
    expect(typeof fs.readFileSync).toBe('function');
  });

  it('should handle async operations', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve('test'), 100);
    });
    
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should handle TypeScript features', () => {
    interface TestInterface {
      id: number;
      name: string;
    }

    const testObject: TestInterface = {
      id: 1,
      name: 'test'
    };

    expect(testObject.id).toBe(1);
    expect(testObject.name).toBe('test');
  });
});