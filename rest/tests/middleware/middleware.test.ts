import { Request, Response, NextFunction } from "express";

// Mock the environment variable before importing middleware
process.env.API_TOKEN = "test-secret-token";

import { authenticate } from "../../src/middleware/middleware";

describe("Authentication Middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call next() with valid Bearer token", () => {
        mockRequest.headers = {
            authorization: "Bearer test-secret-token",
        };

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return 401 when no authorization header is provided", () => {
        mockRequest.headers = {};

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. No token provided.",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header does not start with Bearer", () => {
        mockRequest.headers = {
            authorization: "Basic test-secret-token",
        };

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. No token provided.",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", () => {
        mockRequest.headers = {
            authorization: "Bearer invalid-token",
        };

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Invalid token.",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header is malformed", () => {
        mockRequest.headers = {
            authorization: "Bearer",
        };

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. No token provided.",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle multiple spaces in authorization header", () => {
        mockRequest.headers = {
            authorization: "Bearer  test-secret-token",
        };

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        // Should fail because split(' ')[1] would be empty string
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Invalid token.",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should be case sensitive for Bearer keyword", () => {
        mockRequest.headers = {
            authorization: "bearer test-secret-token",
        };

        authenticate(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. No token provided.",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
});
