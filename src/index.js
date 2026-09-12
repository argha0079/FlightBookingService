import express from "express";
import { PORT } from "./config/envConfig.js";
import { connectDatabase, prisma } from "./config/dbConfig.js";
import apiRouter from "./routes/index.js";
import errorHandler from "./middlewares/globalErrorHandler.js";

const app = express();

const setupAndStartServer = async () => {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/api", apiRouter);

    app.get("/", (req, res) => {
        res.send("Welcome to Booking Service");
    });

    app.use(errorHandler);

    await connectDatabase();

    const server = app.listen(PORT, () => {
        console.log(`Server started at http://localhost:${PORT}`);
    });
}

setupAndStartServer();