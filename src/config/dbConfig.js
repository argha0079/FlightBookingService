import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { DATABASE_URL } from "./envConfig.js";

const connectionString = `${DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export async function connectDatabase() {
    try {
        await prisma.$connect(); 
        console.log('[Database]: Connected successfully');
    } catch (error) {
        console.error('[Database]: Failed to connect', error);
        process.exit(1);
    }
}