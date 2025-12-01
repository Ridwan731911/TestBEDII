// src/routes/roleRoutes.js
import express from "express";
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getRoleUsers,
    getRoleMenuAccess,
} from "../controllers/roleController.js";
import { validateCreateRole } from "../middlewares/validator.js";
import { authenticateToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua routes butuh authentication
router.use(authenticateToken);

/**
 * @route   GET /api/roles
 * @desc    Get all roles with pagination
 * @access  Private (Admin, Manager)
 * @query   page, limit, search, is_active
 */
router.get("/", checkRole("Admin", "Manager"), getAllRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Private (Admin, Manager)
 */
router.get("/:id", checkRole("Admin", "Manager"), getRoleById);

/**
 * @route   POST /api/roles
 * @desc    Create new role
 * @access  Private (Admin)
 */
router.post("/", checkRole("Admin"), validateCreateRole, createRole);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role
 * @access  Private (Admin)
 */
router.put("/:id", checkRole("Admin"), updateRole);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role
 * @access  Private (Admin)
 */
router.delete("/:id", checkRole("Admin"), deleteRole);

/**
 * @route   GET /api/roles/:id/users
 * @desc    Get role's users
 * @access  Private (Admin, Manager)
 */
router.get("/:id/users", checkRole("Admin", "Manager"), getRoleUsers);

/**
 * @route   GET /api/roles/:id/menus
 * @desc    Get role's menu access
 * @access  Private (Admin, Manager)
 */
router.get("/:id/menus", checkRole("Admin", "Manager"), getRoleMenuAccess);

export default router;