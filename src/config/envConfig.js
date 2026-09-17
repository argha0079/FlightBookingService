import { config } from "dotenv";

config();

export const {
    PORT,
    DATABASE_URL,
    FLIGHT_SERVICE_URL,
    EXCHANGE_NAME,
    REMAINDER_BINDING_KEY,
    MESSAGE_BROKER_URL,
} = process.env;