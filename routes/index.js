import express from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import accessRoutes from "./accessRoutes.js";
import menuRoutes from "./menuRoutes.js";
import roleRoutes from "./roleRoutes.js";

const router = express.Router();


router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/access", accessRoutes);
router.use("/menus", menuRoutes);
router.use("/roles", roleRoutes);

export default router;
