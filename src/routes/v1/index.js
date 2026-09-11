import { Router } from "express";

const router = Router();

router.use("/", (req, res) => {
    res.json("/api/v1 is running");
})

export default router;