import { Request, Response, NextFunction } from "express";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access denied. No token provided." });
        return;
    }

    const token = authHeader.split(" ")[1];
    const apiToken = process.env.API_TOKEN;

    if (token === apiToken) {
        next();
    } else {
        res.status(401).json({ error: "Invalid token." });
    }
};
