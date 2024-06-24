import { Router } from "express";
const router = Router();

import userRoutes from "../routes/users/userRoutes.js";

router.use("/api/users", userRoutes);
router.use("/", (req, res) => {
  res.status(200).json({ message: "Hello App" });
});

export default router;
