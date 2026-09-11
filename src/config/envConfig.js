import { config } from "dotenv";

config();

export const {
    PORT,
    DATABASE_URL
} = process.env;