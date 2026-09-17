import { Router } from "express";
import bookingRoutes from "./bookingRoutes.js";
import { BookingController } from "../../controllers/bookingController.js"

const router = Router();
const bookingController = new BookingController();
router.use("/bookings", bookingRoutes);
router.post("/publish", bookingController.sendMessageToQueue);

router.get("/", (req, res) => {
    res.json("/api/v1 is running");
})

export default router;