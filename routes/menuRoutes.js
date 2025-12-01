// src/routes/menuRoutes.js
import express from "express";
import {
    getAllMenus,
    getMenuTree,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getUserMenus,
} from "../controllers/menuController.js";
import { validateCreateMenu } from "../middlewares/validator.js";
import { authenticateToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua routes butuh authentication
router.use(authenticateToken);

/**
 * @route   GET /api/menus
 * @desc    Get all menus (flat list with pagination)
 * @access  Private (Admin, Manager)
 * @query   page, limit, search, is_active
 */
router.get("/", checkRole("Admin", "Manager"), getAllMenus);

/**
 * @route   GET /api/menus/tree
 * @desc    Get menu tree (hierarchical structure)
 * @access  Private (Admin, Manager)
 * @query   is_active
 */
router.get("/tree", checkRole("Admin", "Manager"), getMenuTree);

/**
 * @route   GET /api/menus/user
 * @desc    Get current user's accessible menus
 * @access  Private (All authenticated users)
 */
router.get("/user", getUserMenus);

/**
 * @route   GET /api/menus/:id
 * @desc    Get menu by ID
 * @access  Private (Admin, Manager)
 */
router.get("/:id", checkRole("Admin", "Manager"), getMenuById);

/**
 * @route   POST /api/menus
 * @desc    Create new menu
 * @access  Private (Admin)
 */
router.post("/", checkRole("Admin"), validateCreateMenu, createMenu);

/**
 * @route   PUT /api/menus/:id
 * @desc    Update menu
 * @access  Private (Admin)
 */
router.put("/:id", checkRole("Admin"), updateMenu);

/**
 * @route   DELETE /api/menus/:id
 * @desc    Delete menu
 * @access  Private (Admin)
 */
router.delete("/:id", checkRole("Admin"), deleteMenu);

export default router;