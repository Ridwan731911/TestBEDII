// src/routes/authRoutes.js
import express from "express";
import { login, selectRole, refreshToken, logout, me } from "../controllers/authController.js";
import { validateLogin, validateSelectRole } from "../middlewares/validator.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user with username and password
 * @access  Public
 */
router.post("/login",  login);

/**
 * @route   POST /api/auth/select-role
 * @desc    Select role for users with multiple roles
 * @access  Public
 */
router.post("/select-role", validateSelectRole, selectRole);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post("/refresh-token", refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Public
 */
router.post("/logout", logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user info
 * @access  Private
 */
router.get("/me", authenticateToken, me);

export default router;