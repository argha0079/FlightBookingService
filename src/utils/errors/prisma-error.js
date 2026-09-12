import { Prisma } from "../../../generated/prisma/client.js";

class PrismaError extends Error {
    constructor(error) {
        super();

        this.name = "PrismaError";
        this.message = "Database operation failed";
        this.statusCode = 500;
        this.code = "DATABASE_ERROR";
        this.explanation = error.message;

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            this.handleKnownError(error);
        } else if (
            error instanceof Prisma.PrismaClientValidationError
        ) {
            this.name = "PrismaClientValidationError";
            this.message = "Invalid data provided for database operation";
            this.statusCode = 400;
            this.code = "DATABASE_VALIDATION_ERROR";
        } else if (
            error instanceof Prisma.PrismaClientInitializationError
        ) {
            this.name = "PrismaClientInitializationError";
            this.message = "Database connection failed";
            this.statusCode = 503;
            this.code = "DATABASE_UNAVAILABLE";
        } else if (
            error instanceof Prisma.PrismaClientUnknownRequestError
        ) {
            this.name = "PrismaClientUnknownRequestError";
            this.message = "Unknown database error";
            this.statusCode = 500;
            this.code = "DATABASE_ERROR";
        } else if (
            error instanceof Prisma.PrismaClientRustPanicError
        ) {
            this.name = "PrismaClientRustPanicError";
            this.message = "Database service encountered a critical error";
            this.statusCode = 500;
            this.code = "DATABASE_CRITICAL_ERROR";
        }
    }

    handleKnownError(error) {
        switch (error.code) {
            case "P2000":
                this.message = "Provided value is too long";
                this.statusCode = 400;
                this.code = "VALUE_TOO_LONG";
                break;

            case "P2001":
                this.message = "Requested record was not found";
                this.statusCode = 404;
                this.code = "RECORD_NOT_FOUND";
                break;

            case "P2002":
                this.message = "A record with the provided value already exists";
                this.statusCode = 409;
                this.code = "DUPLICATE_RECORD";
                break;

            case "P2003":
                this.message = "Related record constraint failed";
                this.statusCode = 409;
                this.code = "FOREIGN_KEY_CONSTRAINT";
                break;

            case "P2011":
                this.message = "Required value cannot be null";
                this.statusCode = 400;
                this.code = "NULL_CONSTRAINT_VIOLATION";
                break;

            case "P2012":
                this.message = "Required value is missing";
                this.statusCode = 400;
                this.code = "REQUIRED_VALUE_MISSING";
                break;

            case "P2014":
                this.message = "Required relation is invalid";
                this.statusCode = 400;
                this.code = "RELATION_CONSTRAINT_ERROR";
                break;

            case "P2015":
                this.message = "Related record was not found";
                this.statusCode = 404;
                this.code = "RELATED_RECORD_NOT_FOUND";
                break;

            case "P2019":
                this.message = "Invalid database input";
                this.statusCode = 400;
                this.code = "DATABASE_INPUT_ERROR";
                break;

            case "P2021":
                this.message = "Database table does not exist";
                this.statusCode = 500;
                this.code = "DATABASE_SCHEMA_ERROR";
                break;

            case "P2022":
                this.message = "Database column does not exist";
                this.statusCode = 500;
                this.code = "DATABASE_SCHEMA_ERROR";
                break;

            case "P2024":
                this.message = "Database connection pool timed out";
                this.statusCode = 503;
                this.code = "DATABASE_TIMEOUT";
                break;

            case "P2025":
                this.message = "Requested record was not found";
                this.statusCode = 404;
                this.code = "RECORD_NOT_FOUND";
                break;

            default:
                this.message = "Database operation failed";
                this.statusCode = 500;
                this.code = "DATABASE_ERROR";
        }
    }
}

export default PrismaError;