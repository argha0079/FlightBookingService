import { Router } from "express";
import { BookingController } from "../../controllers/bookingController.js";

const bookingController = new BookingController();
const router = Router();

router.post("/", bookingController.create);

export default router;