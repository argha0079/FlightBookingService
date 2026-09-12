import { config } from "dotenv";

config();

export const {
    PORT,
    DATABASE_URL,
    FLIGHT_SERVICE_URL
} = process.env;