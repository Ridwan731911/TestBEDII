// src/routes/userRoutes.js
import express from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
    getUserRoles,
} from "../controllers/usersController.js";
import { validateCreateUser } from "../middlewares/validator.js";
import { authenticateToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua routes butuh authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Private (Admin, Manager)
 * @query   page, limit, search, is_active
 */
router.get("/", checkRole("Admin", "Manager"), getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Manager)
 */
router.get("/:id", checkRole("Admin", "Manager"), getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post("/", checkRole("Admin"), validateCreateUser, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put("/:id", checkRole("Admin"), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete("/:id", checkRole("Admin"), deleteUser);

/**
 * @route   GET /api/users/:id/roles
 * @desc    Get user's roles
 * @access  Private (Admin, Manager)
 */
router.get("/:id/roles", checkRole("Admin", "Manager"), getUserRoles);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Assign role to user
 * @access  Private (Admin)
 */
router.post("/:id/roles", checkRole("Admin"), assignRole);

/**
 * @route   DELETE /api/users/:id/roles/:roleId
 * @desc    Remove role from user
 * @access  Private (Admin)
 */
router.delete("/:id/roles/:roleId", checkRole("Admin"), removeRole);

export default router;