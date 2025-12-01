// src/routes/accessRoutes.js
import express from "express";
import {
    getAllAccess,
    getAccessById,
    assignAccess,
    updateAccess,
    deleteAccess,
    bulkAssignAccess,
    removeAllRoleAccess,
} from "../controllers/accessController.js";
import { validateAssignAccess } from "../middlewares/validator.js";
import { authenticateToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua routes butuh authentication
router.use(authenticateToken);

/**
 * @route   GET /api/access
 * @desc    Get all role menu access with pagination
 * @access  Private (Admin, Manager)
 * @query   page, limit, id_roles, id_menus
 */
router.get("/", checkRole("Admin", "Manager"), getAllAccess);

/**
 * @route   GET /api/access/:id
 * @desc    Get access by ID
 * @access  Private (Admin, Manager)
 */
router.get("/:id", checkRole("Admin", "Manager"), getAccessById);

/**
 * @route   POST /api/access
 * @desc    Assign menu access to role
 * @access  Private (Admin)
 * @body    { id_roles, id_menus, can_view, can_create, can_update, can_delete }
 */
router.post("/", checkRole("Admin"), validateAssignAccess, assignAccess);

/**
 * @route   POST /api/access/bulk
 * @desc    Bulk assign menu access to role
 * @access  Private (Admin)
 * @body    { id_roles, menus: [{ id_menus, can_view, can_create, can_update, can_delete }] }
 */
router.post("/bulk", checkRole("Admin"), bulkAssignAccess);

/**
 * @route   PUT /api/access/:id
 * @desc    Update menu access
 * @access  Private (Admin)
 */
router.put("/:id", checkRole("Admin"), updateAccess);

/**
 * @route   DELETE /api/access/:id
 * @desc    Delete menu access
 * @access  Private (Admin)
 */
router.delete("/:id", checkRole("Admin"), deleteAccess);

/**
 * @route   DELETE /api/access/role/:roleId
 * @desc    Remove all menu access for a role
 * @access  Private (Admin)
 */
router.delete("/role/:roleId", checkRole("Admin"), removeAllRoleAccess);

export default router;