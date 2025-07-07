// Helper function to transform bigints to regular numbers (extracted for testing)
function transformBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformBigInts(item));
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (typeof obj === 'object') {
    // Handle Date objects specifically
    if (obj instanceof Date) {
      return obj;
    }
    
    const transformed: any = {};
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'bigint') {
        transformed[key] = Number(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        transformed[key] = transformBigInts(obj[key]);
      } else {
        transformed[key] = obj[key];
      }
    });
    return transformed;
  }

  return obj;
}

describe('transformBigInts utility', () => {
  it('should transform bigint values to numbers', () => {
    const input = {
      total_cases: BigInt(1000000),
      total_deaths: BigInt(50000),
      country: 'France',
    };

    const result = transformBigInts(input);

    expect(result.total_cases).toBe(1000000);
    expect(result.total_deaths).toBe(50000);
    expect(result.country).toBe('France');
    expect(typeof result.total_cases).toBe('number');
    expect(typeof result.total_deaths).toBe('number');
  });

  it('should handle nested objects with bigints', () => {
    const input = {
      covid: {
        total_cases: BigInt(5000000),
        total_deaths: BigInt(100000),
      },
      mpox: {
        total_cases: BigInt(25000),
        total_deaths: BigInt(500),
      },
      metadata: {
        updated: '2024-01-01',
        version: 1,
      },
    };

    const result = transformBigInts(input);

    expect(result.covid.total_cases).toBe(5000000);
    expect(result.covid.total_deaths).toBe(100000);
    expect(result.mpox.total_cases).toBe(25000);
    expect(result.mpox.total_deaths).toBe(500);
    expect(result.metadata.updated).toBe('2024-01-01');
    expect(result.metadata.version).toBe(1);
  });

  it('should handle arrays with bigint values', () => {
    const input = [
      { total_cases: BigInt(1000), country: 'France' },
      { total_cases: BigInt(2000), country: 'Germany' },
      { total_cases: BigInt(3000), country: 'Italy' },
    ];

    const result = transformBigInts(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].total_cases).toBe(1000);
    expect(result[1].total_cases).toBe(2000);
    expect(result[2].total_cases).toBe(3000);
    expect(typeof result[0].total_cases).toBe('number');
  });

  it('should handle primitive bigint values', () => {
    const input = BigInt(123456789);
    const result = transformBigInts(input);

    expect(result).toBe(123456789);
    expect(typeof result).toBe('number');
  });

  it('should handle null and undefined values', () => {
    expect(transformBigInts(null)).toBe(null);
    expect(transformBigInts(undefined)).toBe(undefined);
  });

  it('should handle empty objects and arrays', () => {
    expect(transformBigInts({})).toEqual({});
    expect(transformBigInts([])).toEqual([]);
  });

  it('should preserve non-bigint types', () => {
    const input = {
      string: 'test',
      number: 42,
      boolean: true,
      date: new Date('2024-01-01'),
      nullValue: null,
    };

    const result = transformBigInts(input);

    expect(result.string).toBe('test');
    expect(result.number).toBe(42);
    expect(result.boolean).toBe(true);
    expect(result.date).toBeInstanceOf(Date);
    expect(result.nullValue).toBe(null);
  });

  it('should handle deeply nested structures', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            bigintValue: BigInt(999999),
            normalValue: 'nested',
          },
        },
      },
    };

    const result = transformBigInts(input);

    expect(result.level1.level2.level3.bigintValue).toBe(999999);
    expect(result.level1.level2.level3.normalValue).toBe('nested');
    expect(typeof result.level1.level2.level3.bigintValue).toBe('number');
  });

  it('should handle mixed arrays with objects and primitives', () => {
    const input = [
      BigInt(1000),
      { total: BigInt(2000), name: 'test' },
      'string',
      42,
      { nested: { value: BigInt(3000) } },
    ];

    const result = transformBigInts(input);

    expect(result[0]).toBe(1000);
    expect(result[1].total).toBe(2000);
    expect(result[1].name).toBe('test');
    expect(result[2]).toBe('string');
    expect(result[3]).toBe(42);
    expect(result[4].nested.value).toBe(3000);
  });
});