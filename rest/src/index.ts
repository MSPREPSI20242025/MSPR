import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import publicRoutes from "./routes/public";
import authenticatedRoutes from "./routes/authenticated";
import docsRoutes from "./docs";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();

export const portEnv = process.env.BACKEND_PORT;
export const host = process.env.HOST;
export const dbUrl = process.env.DATABASE_URL;
export const apiToken = process.env.API_TOKEN;

if (!portEnv || !dbUrl || !host || !apiToken) {
    console.error("setup .env");
    process.exit(-1);
}

if (
    Number.isNaN(portEnv) ||
    Number(portEnv) < 1024 ||
    Number(portEnv) > 65535
) {
    console.error("PORT is not a number or is not a valid port");
    process.exit(-1);
}

const port = Number(portEnv);

app.use(cors());
app.use(express.json());

app.use("/api", publicRoutes);
app.use("/api", authenticatedRoutes);
app.use("/api/docs", docsRoutes);

app.get("/", (_req: Request, res: Response) => {
    res.json({ enabled: true });
});

app.use(
    (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong!" });
    }
);

async function main() {
    app.listen(port as number, host as string, () => {
        console.log(`⚡ [server]: Server is running at http://${host}:${port}`);
        console.log(
            `⚡ [server]: Api docs available at http://${host}:${port}/api/docs`
        );
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
