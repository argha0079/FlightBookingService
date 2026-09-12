import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { Prisma } from "../generated/prisma/client.js";

import AppError from "../src/errors/appError.js";
import BadRequestError from "../src/errors/badRequestError.js";
import ConflictError from "../src/errors/conflictError.js";
import ForbiddenError from "../src/errors/forbiddenError.js";
import NotFoundError from "../src/errors/notFoundError.js";
import UnauthorizedError from "../src/errors/unauthorisedError.js";
import ValidationError from "../src/errors/validationError.js";
import {
    normalizeError,
    getErrorSeverity
} from "../src/errors/normalizeError.js";
import errorHandler from "../src/middlewares/globalErrorHandler.js";
import bookingRoutes from "../src/routes/v1/bookingRoutes.js";
import {
    validateCreateBooking,
    validateUpdateBooking
} from "../src/middlewares/bookingValidation.js";

describe("AppError hierarchy", () => {
    it("AppError: instance of Error, has statusCode, code, isOperational, stack", () => {
        const err = new AppError("test", 500, "TEST_CODE");

        assert.ok(err instanceof Error);
        assert.strictEqual(err.message, "test");
        assert.strictEqual(err.statusCode, 500);
        assert.strictEqual(err.code, "TEST_CODE");
        assert.strictEqual(err.isOperational, true);
        assert.strictEqual(err.name, "AppError");
        assert.ok(
            typeof err.stack === "string" && err.stack.includes("AppError")
        );
    });

    it("BadRequestError: 400 BAD_REQUEST", () => {
        const err = new BadRequestError();

        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, "BAD_REQUEST");
        assert.strictEqual(err.name, "BadRequestError");
        assert.strictEqual(err.message, "Bad request");
    });

    it("ConflictError: 409 CONFLICT", () => {
        const err = new ConflictError();

        assert.strictEqual(err.statusCode, 409);
        assert.strictEqual(err.code, "CONFLICT");
        assert.strictEqual(err.name, "ConflictError");
    });

    it("ForbiddenError: 403 FORBIDDEN", () => {
        const err = new ForbiddenError();

        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, "FORBIDDEN");
        assert.strictEqual(err.name, "ForbiddenError");
    });

    it("NotFoundError: 404 RESOURCE_NOT_FOUND", () => {
        const err = new NotFoundError();

        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(err.code, "RESOURCE_NOT_FOUND");
        assert.strictEqual(err.name, "NotFoundError");
    });

    it("UnauthorizedError: 401 UNAUTHORIZED", () => {
        const err = new UnauthorizedError();

        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.code, "UNAUTHORIZED");
        assert.strictEqual(err.name, "UnauthorizedError");
    });

    it("ValidationError: 422 VALIDATION_ERROR with details", () => {
        const err = new ValidationError("fail", { a: 1 });

        assert.strictEqual(err.statusCode, 422);
        assert.strictEqual(err.code, "VALIDATION_ERROR");
        assert.strictEqual(err.name, "ValidationError");
        assert.deepStrictEqual(err.details, { a: 1 });
    });

    it("All errors are instanceof AppError and Error", () => {
        const errors = [
            new BadRequestError(),
            new ConflictError(),
            new ForbiddenError(),
            new NotFoundError(),
            new UnauthorizedError(),
            new ValidationError()
        ];

        for (const err of errors) {
            assert.ok(err instanceof AppError);
            assert.ok(err instanceof Error);
            assert.strictEqual(err.isOperational, true);
        }
    });
});

describe("normalizeError (unit)", () => {
    it("AppError is returned as-is", () => {
        const err = new NotFoundError("not found", "TEST");

        assert.strictEqual(normalizeError(err), err);
    });

    it("P2002 → ConflictError 409 RESOURCE_ALREADY_EXISTS", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "unique",
            {
                code: "P2002",
                clientVersion: "7.10.0",
                meta: { target: ["email"] }
            }
        );
        const normalized = normalizeError(err);

        assert.ok(normalized instanceof AppError);
        assert.strictEqual(normalized.statusCode, 409);
        assert.strictEqual(normalized.code, "RESOURCE_ALREADY_EXISTS");
        assert.strictEqual(normalized.name, "ConflictError");
    });

    it("P2025 → NotFoundError 404 RESOURCE_NOT_FOUND", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "not found",
            { code: "P2025", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 404);
        assert.strictEqual(normalized.code, "RESOURCE_NOT_FOUND");
    });

    it("P2003 → ConflictError 409 RELATED_RESOURCE_CONFLICT", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "FK violation",
            { code: "P2003", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 409);
        assert.strictEqual(normalized.code, "RELATED_RESOURCE_CONFLICT");
    });

    it("P2024 → AppError 503 DATABASE_CONNECTION_POOL_TIMEOUT", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "timeout",
            { code: "P2024", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 503);
        assert.strictEqual(
            normalized.code,
            "DATABASE_CONNECTION_POOL_TIMEOUT"
        );
    });

    it("P2000 → BadRequestError 400 VALUE_TOO_LONG", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "too long",
            { code: "P2000", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 400);
        assert.strictEqual(normalized.code, "VALUE_TOO_LONG");
    });

    it("P2011 → BadRequestError 400 NULL_CONSTRAINT_VIOLATION", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "null",
            { code: "P2011", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 400);
        assert.strictEqual(normalized.code, "NULL_CONSTRAINT_VIOLATION");
    });

    it("P2021 → AppError 500 DATABASE_SCHEMA_ERROR", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "table missing",
            { code: "P2021", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 500);
        assert.strictEqual(normalized.code, "DATABASE_SCHEMA_ERROR");
    });

    it("Unknown Prisma code → AppError 500 DATABASE_ERROR", () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            "weird",
            { code: "P9999", clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 500);
        assert.strictEqual(normalized.code, "DATABASE_ERROR");
    });

    it("PrismaClientValidationError → ValidationError 422", () => {
        const err = new Prisma.PrismaClientValidationError(
            "raw validation msg",
            { clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.ok(normalized instanceof ValidationError);
        assert.strictEqual(normalized.statusCode, 422);
        assert.strictEqual(normalized.code, "VALIDATION_ERROR");
        assert.strictEqual(normalized.message, "Request validation failed");
        assert.strictEqual(normalized.details, null);
    });

    it("PrismaClientUnknownRequestError → AppError 500 DATABASE_ERROR", () => {
        const err = new Prisma.PrismaClientUnknownRequestError(
            "unknown",
            { clientVersion: "7.10.0" }
        );
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 500);
        assert.strictEqual(normalized.code, "DATABASE_ERROR");
    });

    it("entity.parse.failed → BadRequestError 400 INVALID_JSON", () => {
        const err = new SyntaxError("Unexpected token");
        err.type = "entity.parse.failed";
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 400);
        assert.strictEqual(normalized.code, "INVALID_JSON");
    });

    it("Plain unknown error → AppError 500 INTERNAL_SERVER_ERROR", () => {
        const err = new Error("something random");
        const normalized = normalizeError(err);

        assert.strictEqual(normalized.statusCode, 500);
        assert.strictEqual(normalized.code, "INTERNAL_SERVER_ERROR");
        assert.strictEqual(normalized.message, "Internal server error");
    });

    it("getErrorSeverity: PrismaClientRustPanicError → fatal", () => {
        const err = new Prisma.PrismaClientRustPanicError(
            "panic",
            { clientVersion: "7.10.0" }
        );

        assert.strictEqual(getErrorSeverity(err), "fatal");
    });

    it("getErrorSeverity: PrismaClientInitializationError → fatal", () => {
        const err = new Prisma.PrismaClientInitializationError(
            "init fail",
            { clientVersion: "7.10.0" },
            "test-code"
        );

        assert.strictEqual(getErrorSeverity(err), "fatal");
    });

    it("getErrorSeverity: regular AppError → error", () => {
        assert.strictEqual(getErrorSeverity(new NotFoundError()), "error");
    });
});

describe("HTTP error responses", () => {
    let server;
    let baseUrl;

    before(() => {
        const app = express();

        app.get("/throw/notfound", async () => {
            throw new NotFoundError(
                "Booking not found",
                "BOOKING_NOT_FOUND"
            );
        });

        app.get("/throw/conflict", async () => {
            throw new ConflictError(
                "Resource conflict",
                "CONFLICT"
            );
        });

        app.get("/throw/unauthorized", async () => {
            throw new UnauthorizedError();
        });

        app.get("/throw/forbidden", async () => {
            throw new ForbiddenError();
        });

        app.get("/throw/validation-with-details", async () => {
            throw new ValidationError(
                "Request validation failed",
                { field: "bad" }
            );
        });

        app.get("/throw/internal", async () => {
            throw new Error("secret internal detail");
        });

        app.get("/throw/async-reject", async () => {
            await Promise.resolve();
            throw new Error("boom");
        });

        app.get("/throw/p2002", async () => {
            throw new Prisma.PrismaClientKnownRequestError(
                "Unique constraint violation",
                {
                    code: "P2002",
                    clientVersion: "7.10.0",
                    meta: { target: ["email"] }
                }
            );
        });

        app.get("/throw/p2025", async () => {
            throw new Prisma.PrismaClientKnownRequestError(
                "Record not found",
                { code: "P2025", clientVersion: "7.10.0" }
            );
        });

        app.get("/throw/p2024", async () => {
            throw new Prisma.PrismaClientKnownRequestError(
                "Pool timeout",
                { code: "P2024", clientVersion: "7.10.0" }
            );
        });

        app.get("/throw/unknown-prisma", async () => {
            throw new Prisma.PrismaClientUnknownRequestError(
                "Something went wrong",
                { clientVersion: "7.10.0" }
            );
        });

        app.get("/throw/prisma-validation", async () => {
            throw new Prisma.PrismaClientValidationError(
                "Invalid query",
                { clientVersion: "7.10.0" }
            );
        });

        app.use((req, res, next) => {
            next(
                new NotFoundError("Route not found", "ROUTE_NOT_FOUND")
            );
        });

        app.use(errorHandler);

        return new Promise((resolve) => {
            server = app.listen(0, () => {
                baseUrl = `http://127.0.0.1:${server.address().port}`;
                resolve();
            });
        });
    });

    after(() => {
        return new Promise((resolve) => {
            server.close(() => resolve());
        });
    });

    it("NotFoundError → 404", async () => {
        const res = await fetch(`${baseUrl}/throw/notfound`);
        const body = await res.json();

        assert.strictEqual(res.status, 404);
        assert.strictEqual(body.success, false);
        assert.strictEqual(body.error.code, "BOOKING_NOT_FOUND");
        assert.strictEqual(body.error.message, "Booking not found");
        assert.ok(!("stack" in body));
    });

    it("ConflictError → 409", async () => {
        const res = await fetch(`${baseUrl}/throw/conflict`);
        const body = await res.json();

        assert.strictEqual(res.status, 409);
        assert.strictEqual(body.error.code, "CONFLICT");
    });

    it("UnauthorizedError → 401", async () => {
        const res = await fetch(`${baseUrl}/throw/unauthorized`);
        const body = await res.json();

        assert.strictEqual(res.status, 401);
        assert.strictEqual(body.error.code, "UNAUTHORIZED");
    });

    it("ForbiddenError → 403", async () => {
        const res = await fetch(`${baseUrl}/throw/forbidden`);
        const body = await res.json();

        assert.strictEqual(res.status, 403);
        assert.strictEqual(body.error.code, "FORBIDDEN");
    });

    it("ValidationError with details → 422 with details", async () => {
        const res = await fetch(`${baseUrl}/throw/validation-with-details`);
        const body = await res.json();

        assert.strictEqual(res.status, 422);
        assert.strictEqual(body.error.code, "VALIDATION_ERROR");
        assert.deepStrictEqual(body.error.details, { field: "bad" });
    });

    it("Unknown error → 500 INTERNAL_SERVER_ERROR with generic message", async () => {
        const res = await fetch(`${baseUrl}/throw/internal`);
        const body = await res.json();

        assert.strictEqual(res.status, 500);
        assert.strictEqual(body.error.code, "INTERNAL_SERVER_ERROR");
        assert.strictEqual(body.error.message, "Internal server error");
        assert.ok(!body.error.message.includes("secret"));
    });

    it("Async rejection reaches errorHandler automatically (Express 5)", async () => {
        const res = await fetch(`${baseUrl}/throw/async-reject`);
        const body = await res.json();

        assert.strictEqual(res.status, 500);
        assert.strictEqual(body.success, false);
        assert.strictEqual(body.error.code, "INTERNAL_SERVER_ERROR");
    });

    it("Prisma P2002 → 409 RESOURCE_ALREADY_EXISTS", async () => {
        const res = await fetch(`${baseUrl}/throw/p2002`);
        const body = await res.json();
        const str = JSON.stringify(body);

        assert.strictEqual(res.status, 409);
        assert.strictEqual(body.error.code, "RESOURCE_ALREADY_EXISTS");
        assert.ok(!str.includes("email"));
        assert.ok(!str.includes("Prisma"));
    });

    it("Prisma P2025 → 404 RESOURCE_NOT_FOUND", async () => {
        const res = await fetch(`${baseUrl}/throw/p2025`);
        const body = await res.json();

        assert.strictEqual(res.status, 404);
        assert.strictEqual(body.error.code, "RESOURCE_NOT_FOUND");
    });

    it("Prisma P2024 → 503 DATABASE_CONNECTION_POOL_TIMEOUT", async () => {
        const res = await fetch(`${baseUrl}/throw/p2024`);
        const body = await res.json();

        assert.strictEqual(res.status, 503);
        assert.strictEqual(
            body.error.code,
            "DATABASE_CONNECTION_POOL_TIMEOUT"
        );
        assert.strictEqual(body.error.message, "Internal server error");
    });

    it("Prisma unknown request error → 500 DATABASE_ERROR", async () => {
        const res = await fetch(`${baseUrl}/throw/unknown-prisma`);
        const body = await res.json();

        assert.strictEqual(res.status, 500);
        assert.strictEqual(body.error.code, "DATABASE_ERROR");
        assert.strictEqual(body.error.message, "Internal server error");
    });

    it("PrismaClientValidationError → 422 VALIDATION_ERROR", async () => {
        const res = await fetch(`${baseUrl}/throw/prisma-validation`);
        const body = await res.json();

        assert.strictEqual(res.status, 422);
        assert.strictEqual(body.error.code, "VALIDATION_ERROR");
        assert.strictEqual(
            body.error.message,
            "Request validation failed"
        );
    });

    it("Response never contains stack trace", async () => {
        const res = await fetch(`${baseUrl}/throw/internal`);
        const body = await res.json();

        assert.ok(!("stack" in body));
        assert.ok(!("stack" in body.error));
    });

    it("Response never contains Prisma internal details", async () => {
        const res = await fetch(`${baseUrl}/throw/p2002`);
        const body = await res.json();
        const str = JSON.stringify(body);

        assert.ok(!str.includes("Prisma"));
        assert.ok(!str.includes("meta"));
        assert.ok(!str.includes("clientVersion"));
        assert.ok(!str.includes("email"));
    });

    it("Unknown route → 404 ROUTE_NOT_FOUND", async () => {
        const res = await fetch(`${baseUrl}/some/unknown/path`);
        const body = await res.json();

        assert.strictEqual(res.status, 404);
        assert.strictEqual(body.error.code, "ROUTE_NOT_FOUND");
        assert.strictEqual(body.error.message, "Route not found");
    });
});

describe("Booking validation middleware", () => {
    let valServer;
    let valBaseUrl;

    before(() => {
        const valApp = express();

        valApp.use(express.json());
        valApp.use("/api/v1/bookings", bookingRoutes);
        valApp.use((req, res, next) => {
            next(
                new NotFoundError("Route not found", "ROUTE_NOT_FOUND")
            );
        });
        valApp.use(errorHandler);

        return new Promise((resolve) => {
            valServer = valApp.listen(0, () => {
                valBaseUrl = `http://127.0.0.1:${valServer.address().port}`;
                resolve();
            });
        });
    });

    after(() => {
        return new Promise((resolve) => {
            valServer.close(() => resolve());
        });
    });

    it("POST with empty object → 422 validation details", async () => {
        const res = await fetch(`${valBaseUrl}/api/v1/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        const body = await res.json();

        assert.strictEqual(res.status, 422);
        assert.strictEqual(body.error.code, "VALIDATION_ERROR");
        assert.ok(body.error.details.flightId);
        assert.ok(body.error.details.userId);
    });

    it("POST with invalid JSON → 400 INVALID_JSON", async () => {
        const res = await fetch(`${valBaseUrl}/api/v1/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "not-json"
        });
        const body = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.error.code, "INVALID_JSON");
    });

    it("POST with negative flightId → 422", async () => {
        const res = await fetch(`${valBaseUrl}/api/v1/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flightId: -1, userId: 1 })
        });
        const body = await res.json();

        assert.strictEqual(res.status, 422);
        assert.ok(body.error.details.flightId);
    });

    it("POST with invalid status enum → 422", async () => {
        const res = await fetch(`${valBaseUrl}/api/v1/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flightId: 1, userId: 1, status: "INVALID" })
        });
        const body = await res.json();

        assert.strictEqual(res.status, 422);
        assert.ok(body.error.details.status);
    });

    it("PATCH with empty object → 422", async () => {
        const res = await fetch(`${valBaseUrl}/api/v1/bookings/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        const body = await res.json();

        assert.strictEqual(res.status, 422);
        assert.strictEqual(body.error.code, "VALIDATION_ERROR");
        assert.ok(body.error.details.body);
    });
});

describe("Booking validation middleware (unit)", () => {
    it("validateCreateBooking passes valid body to next()", () => {
        let passed = false;

        validateCreateBooking(
            { body: { flightId: 1, userId: 2 } },
            {},
            () => { passed = true; }
        );

        assert.ok(passed);
    });

    it("validateCreateBooking rejects missing fields", () => {
        let error;

        validateCreateBooking(
            { body: {} },
            {},
            (err) => { error = err; }
        );

        assert.ok(error instanceof ValidationError);
        assert.ok(error.details.flightId);
        assert.ok(error.details.userId);
    });

    it("validateUpdateBooking rejects empty update body", () => {
        let error;

        validateUpdateBooking(
            { body: {} },
            {},
            (err) => { error = err; }
        );

        assert.ok(error instanceof ValidationError);
        assert.ok(error.details.body);
    });

    it("validateUpdateBooking rejects invalid status", () => {
        let error;

        validateUpdateBooking(
            { body: { status: "NOPE" } },
            {},
            (err) => { error = err; }
        );

        assert.ok(error instanceof ValidationError);
        assert.ok(error.details.status);
    });

    it("validateUpdateBooking accepts a partial valid body", () => {
        let passed = false;

        validateUpdateBooking(
            { body: { status: "BOOKED" } },
            {},
            () => { passed = true; }
        );

        assert.ok(passed);
    });
});