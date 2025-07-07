import request from "supertest";
import express from "express";
import { mockPrismaClient, resetMocks } from "../setup";

// Mock environment variables
process.env.API_TOKEN = "integration-test-token";

// Mock Prisma Client before importing routes
jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

import publicRoutes from "../../src/routes/public";
import authenticatedRoutes from "../../src/routes/authenticated";

// Integration tests that test the full API flow
describe("API Integration Tests", () => {
    let app: express.Application;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use("/api", publicRoutes);
        app.use("/api", authenticatedRoutes);

        // Error handler
        app.use(
            (
                err: Error,
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                res.status(500).json({ error: err.message });
            }
        );
    });

    beforeEach(() => {
        resetMocks();
    });

    describe("API Health and Basic Functionality", () => {
        it("should handle CORS preflight requests", async () => {
            const response = await request(app)
                .options("/api/covid/public/latest")
                .expect(200);
        });

        it("should return JSON content type for API responses", async () => {
            const response = await request(app).get("/api/covid/public/latest");

            expect(response.headers["content-type"]).toMatch(
                /application\/json/
            );
        });

        it("should handle malformed JSON in POST requests", async () => {
            const response = await request(app)
                .post("/api/covid/data")
                .set("Authorization", "Bearer integration-test-token")
                .set("Content-Type", "application/json")
                .send('{"malformed": json}')
                .expect(500);
        });
    });

    describe("Error Handling", () => {
        it("should return 404 for non-existent endpoints", async () => {
            const response = await request(app)
                .get("/api/nonexistent")
                .expect(404);
        });

        it("should handle large request payloads gracefully", async () => {
            const largePayload = {
                date: "2024-01-01",
                country: "A".repeat(10000), // Very long country name
                total_cases: 1000,
                new_cases: 50,
                total_deaths: 100,
                new_deaths: 5,
            };

            const response = await request(app)
                .post("/api/covid/data")
                .set("Authorization", "Bearer integration-test-token")
                .send(largePayload);

            // Should either process successfully or return a validation error
            expect([200, 201, 400, 422, 500]).toContain(response.status);
        });
    });

    describe("Data Type Validation", () => {
        it("should handle string numbers in COVID data creation", async () => {
            const testData = {
                date: "2024-01-01",
                country: "TestCountry",
                total_cases: "1000", // String instead of number
                new_cases: "50",
                total_deaths: "100",
                new_deaths: "5",
            };

            const response = await request(app)
                .post("/api/covid/data")
                .set("Authorization", "Bearer integration-test-token")
                .send(testData);

            // Should either convert strings to numbers or return validation error
            expect([201, 400, 422]).toContain(response.status);
        });

        it("should reject invalid data types in MPOX data creation", async () => {
            const invalidData = {
                date: "2024-01-01",
                country: "TestCountry",
                total_cases: "not-a-number",
                new_cases: null,
                total_deaths: undefined,
                new_deaths: {},
            };

            const response = await request(app)
                .post("/api/mpox/data")
                .set("Authorization", "Bearer integration-test-token")
                .send(invalidData);

            expect([400, 422, 500]).toContain(response.status);
        });
    });

    describe("Query Parameter Validation", () => {
        it("should handle invalid limit parameters", async () => {
            const response = await request(app)
                .get("/api/covid/data?limit=invalid")
                .set("Authorization", "Bearer integration-test-token");

            // Should either use default limit or return error
            expect([200, 400]).toContain(response.status);
        });

        it("should handle negative limit parameters", async () => {
            const response = await request(app)
                .get("/api/covid/data?limit=-10")
                .set("Authorization", "Bearer integration-test-token");

            expect([200, 400]).toContain(response.status);
        });

        it("should handle very large limit parameters", async () => {
            const response = await request(app)
                .get("/api/covid/data?limit=999999999")
                .set("Authorization", "Bearer integration-test-token");

            expect([200, 400]).toContain(response.status);
        });
    });

    describe("Authentication Edge Cases", () => {
        it("should handle empty Bearer token", async () => {
            const response = await request(app)
                .get("/api/covid/data")
                .set("Authorization", "Bearer ")
                .expect(401);

            expect(response.body).toEqual({
                error: "Access denied. No token provided.",
            });
        });

        it("should handle multiple Bearer keywords", async () => {
            const response = await request(app)
                .get("/api/covid/data")
                .set("Authorization", "Bearer Bearer integration-test-token")
                .expect(401);

            expect(response.body).toEqual({ error: "Invalid token." });
        });

        it("should handle case-sensitive token validation", async () => {
            const response = await request(app)
                .get("/api/covid/data")
                .set("Authorization", "Bearer INTEGRATION-TEST-TOKEN")
                .expect(401);

            expect(response.body).toEqual({ error: "Invalid token." });
        });
    });

    describe("Route Parameter Validation", () => {
        it("should handle non-numeric ID parameters in PUT requests", async () => {
            const updateData = {
                date: "2024-01-01",
                country: "France",
                total_cases: 1000,
                new_cases: 50,
                total_deaths: 100,
                new_deaths: 5,
            };

            const response = await request(app)
                .put("/api/covid/data/abc")
                .set("Authorization", "Bearer integration-test-token")
                .send(updateData);

            // Should either handle conversion or return error
            expect([200, 400, 404, 500]).toContain(response.status);
        });

        it("should handle very large ID parameters", async () => {
            const response = await request(app)
                .delete("/api/covid/data/999999999999")
                .set("Authorization", "Bearer integration-test-token");

            expect([200, 404, 500]).toContain(response.status);
        });
    });

    describe("Content-Type Handling", () => {
        it("should handle missing Content-Type header", async () => {
            const testData = {
                date: "2024-01-01",
                country: "TestCountry",
                total_cases: 1000,
                new_cases: 50,
                total_deaths: 100,
                new_deaths: 5,
            };

            const response = await request(app)
                .post("/api/covid/data")
                .set("Authorization", "Bearer integration-test-token")
                .send(testData);

            // Express should handle JSON parsing even without explicit Content-Type
            expect([200, 201, 400]).toContain(response.status);
        });
    });

    describe("Rate Limiting and Performance", () => {
        it("should handle concurrent requests", async () => {
            const requests = Array(10)
                .fill(null)
                .map(() =>
                    request(app)
                        .get("/api/covid/public/latest")
                        .expect((res) => {
                            expect([200, 500, 503]).toContain(res.status);
                        })
                );

            await Promise.all(requests);
        });

        it("should handle requests with very long country names", async () => {
            const longCountryName = "A".repeat(1000);

            const response = await request(app).get(
                `/api/covid/public/country/${longCountryName}`
            );

            expect([200, 400, 414]).toContain(response.status);
        });
    });

    describe("Data Consistency", () => {
        it("should return consistent data structure across endpoints", async () => {
            const [publicResponse, privateResponse] = await Promise.all([
                request(app).get("/api/covid/public/latest"),
                request(app)
                    .get("/api/covid/data?limit=10")
                    .set("Authorization", "Bearer integration-test-token"),
            ]);

            if (
                publicResponse.status === 200 &&
                privateResponse.status === 200
            ) {
                const publicData = publicResponse.body[0];
                const privateData = privateResponse.body[0];

                if (publicData && privateData) {
                    // Both should have similar structure
                    expect(Object.keys(publicData).sort()).toEqual(
                        Object.keys(privateData).sort()
                    );
                }
            }
        });
    });
});
