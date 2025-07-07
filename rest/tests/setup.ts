// Mock Prisma Client for testing
export const mockPrismaClient = {
    covidData: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    mpoxData: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
};

export const mockCovidData = [
    {
        index: 1,
        date: new Date("2024-01-01").toUTCString(),
        country: "France",
        total_cases: 1000,
        new_cases: 50,
        total_deaths: 100,
        new_deaths: 5,
    },
    {
        index: 2,
        date: new Date("2024-01-02").toUTCString(),
        country: "France",
        total_cases: 1050,
        new_cases: 50,
        total_deaths: 105,
        new_deaths: 5,
    },
];

export const mockMpoxData = [
    {
        index: 1,
        date: new Date("2024-01-01").toUTCString(),
        country: "USA",
        total_cases: 500,
        new_cases: 25,
        total_deaths: 50,
        new_deaths: 2,
    },
    {
        index: 2,
        date: new Date("2024-01-02").toUTCString(),
        country: "USA",
        total_cases: 525,
        new_cases: 25,
        total_deaths: 52,
        new_deaths: 2,
    },
];

export const mockStatsData = {
    covid: {
        total_cases: BigInt(5000000),
        total_deaths: BigInt(50000),
    },
    mpox: {
        total_cases: BigInt(25000),
        total_deaths: BigInt(250),
    },
};

// Helper to reset all mocks
export const resetMocks = () => {
    jest.clearAllMocks();
    Object.values(mockPrismaClient.covidData).forEach((mock) =>
        mock.mockReset()
    );
    Object.values(mockPrismaClient.mpoxData).forEach((mock) =>
        mock.mockReset()
    );
    mockPrismaClient.$queryRaw.mockReset();
    mockPrismaClient.$disconnect.mockReset();
};
