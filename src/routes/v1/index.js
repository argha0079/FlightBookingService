import { Router } from "express";
import bookingRoutes from "./bookingRoutes.js";

const router = Router();

router.use("/bookings", bookingRoutes);

router.get("/", (req, res) => {
    res.json("/api/v1 is running");
})

export default router;