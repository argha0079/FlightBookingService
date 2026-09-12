import PrismaError from "../utils/errors/prisma-error.js";

const errorHandler = (error, req, res, next) => {
    let handledError = error;
    if (error.name.startsWith("Prisma")) {
        handledError = new PrismaError(error);
    }
    console.error({
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: req.originalUrl
    });

    res.status(handledError.statusCode || 500).json({
        success: false,
        error: {
            code: handledError.code || "INTERNAL_SERVER_ERROR",
            message: handledError.message
        }
    });
};

export default errorHandler;