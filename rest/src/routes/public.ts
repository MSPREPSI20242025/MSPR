import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Helper function to transform bigints to regular numbers
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

// Public COVID data routes (unprotected)
router.get(
    "/covid/public/latest",
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const latestData = await prisma.covidData.findMany({
                take: 10,
                orderBy: {
                    date: "desc",
                },
            });
            res.json(transformBigInts(latestData));
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Public MPOX summary (unprotected)
router.get(
    "/mpox/public/summary",
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const summary = await prisma.$queryRaw`
      SELECT country, MAX(total_cases) as latest_cases
      FROM "mpox_data"
      GROUP BY country
      ORDER BY latest_cases DESC
      LIMIT 5
    `;
            res.json(transformBigInts(summary));
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Public endpoint to get COVID data for a specific country
router.get(
    "/covid/public/country/:country",
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { country } = req.params;

            const data = await prisma.covidData.findMany({
                where: {
                    country,
                },
                orderBy: {
                    date: "desc",
                },
                take: 30, // Last 30 weeks
            });

            res.json(transformBigInts(data));
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

// Public endpoint to get global COVID totals
router.get(
    "/covid/public/totals",
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const latestDate = await prisma.covidData.findFirst({
                orderBy: {
                    date: "desc",
                },
                select: {
                    date: true,
                },
            });

            if (!latestDate) {
                res.json({
                    total_cases: 0,
                    total_deaths: 0,
                    total_recovered: 0,
                });
                return;
            }

            const totals: any = await prisma.$queryRaw`
      SELECT 
        SUM(total_cases) as total_cases, 
        SUM(total_deaths) as total_deaths
      FROM "covid_data"
      WHERE date = ${latestDate.date}
    `;

            const realTotals = {};

            res.json(transformBigInts(totals[0]));
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
);

export default router;
