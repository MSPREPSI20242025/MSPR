import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/middleware";

const router = Router();
const prisma = new PrismaClient();

// Helper function to transform bigints to regular numbers
function transformBigInts(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => transformBigInts(item));
    }

    if (typeof obj === "bigint") {
        return Number(obj);
    }

    if (typeof obj === "object" && obj !== null) {
        // Handle Date objects and other special objects
        if (obj instanceof Date) {
            return obj;
        }

        // Handle serialized big number objects (with s, e, d properties)
        if (obj.hasOwnProperty('s') && obj.hasOwnProperty('e') && obj.hasOwnProperty('d')) {
            // This appears to be a serialized big number - convert to regular number
            if (Array.isArray(obj.d)) {
                // Reconstruct the number from the serialized format
                const digits = obj.d.join('');
                return Number(digits);
            }
        }

        const transformed: any = {};
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "bigint") {
                transformed[key] = Number(obj[key]);
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                transformed[key] = transformBigInts(obj[key]);
            } else {
                transformed[key] = obj[key];
            }
        });
        return transformed;
    }
    
    return obj;
}

// Protected COVID data routes
router.get(
    "/covid/data",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { country, limit = "100" } = req.query;

            const data = await prisma.covidData.findMany({
                where: country ? { country: String(country) } : undefined,
                take: Number(limit),
                orderBy: {
                    date: "desc",
                },
            });

            res.json(transformBigInts(data));
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected MPOX data routes
router.get(
    "/mpox/data",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { country, limit = "100" } = req.query;

            const data = await prisma.mpoxData.findMany({
                where: country ? { country: String(country) } : undefined,
                take: Number(limit),
                orderBy: {
                    date: "desc",
                },
            });

            res.json(transformBigInts(data));
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for aggregated stats
router.get(
    "/stats/summary",
    authenticate,
    async (_req: Request, res: Response): Promise<void> => {
        try {
            // Get the latest global totals for COVID
            const covidStats: any = await prisma.$queryRaw`
      SELECT SUM(total_cases) as total_cases, SUM(total_deaths) as total_deaths
      FROM "covid_data"
      WHERE date = (SELECT MAX(date) FROM "covid_data")
    `;

            // Get the latest global totals for MPOX
            const mpoxStats: any = await prisma.$queryRaw`
      SELECT SUM(total_cases) as total_cases, SUM(total_deaths) as total_deaths
      FROM "mpox_data"
      WHERE date = (SELECT MAX(date) FROM "mpox_data")
    `;

            res.json(
                transformBigInts({
                    covid: covidStats[0],
                    mpox: mpoxStats[0],
                })
            );
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for adding new COVID data
router.post(
    "/covid/data",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                date,
                country,
                total_cases,
                new_cases,
                total_deaths,
                new_deaths,
            } = req.body;

            await prisma.covidData.create({
                data: {
                    date,
                    country,
                    total_cases: Number(total_cases),
                    new_cases: Number(new_cases),
                    total_deaths: Number(total_deaths),
                    new_deaths: Number(new_deaths),
                },
            });

            res.status(201).json({
                success: true,
                message: "Data added successfully",
            });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for adding new MPOX data
router.post(
    "/mpox/data",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                date,
                country,
                total_cases,
                new_cases,
                total_deaths,
                new_deaths,
            } = req.body;

            if (
                !date ||
                !country ||
                total_cases === undefined ||
                new_cases === undefined ||
                total_deaths === undefined ||
                new_deaths === undefined
            ) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            await prisma.mpoxData.create({
                data: {
                    date,
                    country,
                    total_cases: Number(total_cases),
                    new_cases: Number(new_cases),
                    total_deaths: Number(total_deaths),
                    new_deaths: Number(new_deaths),
                },
            });

            res.status(201).json({
                success: true,
                message: "Data added successfully",
            });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for updating COVID data by ID
router.put(
    "/covid/data/:id",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const {
                date,
                country,
                total_cases,
                new_cases,
                total_deaths,
                new_deaths,
            } = req.body;

            await prisma.covidData.update({
                where: { index: id },
                data: {
                    date,
                    country,
                    total_cases: Number(total_cases),
                    new_cases: Number(new_cases),
                    total_deaths: Number(total_deaths),
                    new_deaths: Number(new_deaths),
                },
            });

            res.json({ success: true, message: "Data updated successfully" });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for updating MPOX data by ID
router.put(
    "/mpox/data/:id",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const {
                date,
                country,
                total_cases,
                new_cases,
                total_deaths,
                new_deaths,
            } = req.body;

            await prisma.mpoxData.update({
                where: { index: id },
                data: {
                    date,
                    country,
                    total_cases: Number(total_cases),
                    new_cases: Number(new_cases),
                    total_deaths: Number(total_deaths),
                    new_deaths: Number(new_deaths),
                },
            });

            res.json({ success: true, message: "Data updated successfully" });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for deleting COVID data by ID
router.delete(
    "/covid/data/:id",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            await prisma.covidData.delete({
                where: { index: id },
            });

            res.json({ success: true, message: "Data deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Protected route for deleting MPOX data by ID
router.delete(
    "/mpox/data/:id",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            await prisma.mpoxData.delete({
                where: { index: id },
            });

            res.json({ success: true, message: "Data deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

export default router;
