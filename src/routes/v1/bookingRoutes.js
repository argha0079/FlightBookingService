import { Router } from "express";
import * as bookingController from "../../controllers/bookingController.js"
const router = Router();

router.post("/", bookingController.create);


export default router;