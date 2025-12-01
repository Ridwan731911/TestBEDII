// src/controllers/menuController.js
import Menu from "../models/menus.js";
import Role from "../models/roles.js";
import RoleMenuAccess from "../models/roleMenuAccess.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { Op } from "sequelize";

// Get all menus (flat list with pagination)
export const getAllMenus = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "", is_active = "" } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { menu_name: { [Op.iLike]: `%${search}%` } },
                { menu_url: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (is_active) {
            whereClause.is_active = is_active;
        }

        // Get menus
        const { count, rows } = await Menu.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Menu,
                    as: "parent",
                    attributes: ["id_menus", "menu_name"],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["level", "ASC"], ["order_number", "ASC"]],
        });

        return paginatedResponse(
            res,
            rows,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                totalData: count,
                totalPages: Math.ceil(count / limit),
            },
            "Menus retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};

// Get menu tree (hierarchical structure)
export const getMenuTree = async (req, res, next) => {
    try {
        const { is_active = "active" } = req.query;

        const whereClause = { parent_id: null };
        if (is_active) {
            whereClause.is_active = is_active;
        }

        // Recursive function to build tree
        const buildMenuTree = async (parentId = null, depth = 0) => {
            const menus = await Menu.findAll({
                where: {
                    parent_id: parentId,
                    ...(is_active && { is_active }),
                },
                order: [["order_number", "ASC"]],
            });

            const menuTree = [];
            for (const menu of menus) {
                const menuData = menu.toJSON();
                menuData.children = await buildMenuTree(menu.id_menus, depth + 1);
                menuTree.push(menuData);
            }

            return menuTree;
        };

        const tree = await buildMenuTree();

        return successResponse(res, tree, "Menu tree retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Get menu by ID
export const getMenuById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const menu = await Menu.findByPk(id, {
            include: [
                {
                    model: Menu,
                    as: "parent",
                    attributes: ["id_menus", "menu_name"],
                },
                {
                    model: Menu,
                    as: "children",
                    order: [["order_number", "ASC"]],
                },
            ],
        });

        if (!menu) {
            return errorResponse(res, "Menu not found", 404);
        }

        return successResponse(res, menu, "Menu retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Create new menu
export const createMenu = async (req, res, next) => {
    try {
        const {
            parent_id = null,
            menu_name,
            order_number = 0,
            is_active = "active",
        } = req.body;

        // If parent_id provided, check if parent exists
        if (parent_id) {
            const parentMenu = await Menu.findByPk(parent_id);
            if (!parentMenu) {
                return errorResponse(res, "Parent menu not found", 404);
            }
        }

        const menu = await Menu.create({
            menu_name,
            
            
            parent_id,
            order_number,
            is_active,
        });

        return successResponse(res, menu, "Menu created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Update menu
export const updateMenu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { parent_id, menu_name, order_number, is_active } = req.body;

        const menu = await Menu.findByPk(id);

        if (!menu) {
            return errorResponse(res, "Menu not found", 404);
        }

        // Check if trying to set parent to itself or its children
        if (parent_id && parent_id !== null) {
            if (parent_id === id) {
                return errorResponse(res, "Menu cannot be its own parent", 400);
            }

            // Check if parent exists
            const parentMenu = await Menu.findByPk(parent_id);
            if (!parentMenu) {
                return errorResponse(res, "Parent menu not found", 404);
            }

            // Check if parent is a child of this menu (prevent circular reference)
            let currentParent = parentMenu;
            while (currentParent && currentParent.parent_id !== null) {
                if (currentParent.parent_id === parseInt(id)) {
                    return errorResponse(
                        res,
                        "Cannot set parent to a child menu (circular reference)",
                        400
                    );
                }
                currentParent = await Menu.findByPk(currentParent.parent_id);
            }
        }

        // Update menu
        const updateData = {};
        if (parent_id !== undefined) updateData.parent_id = parent_id;
        if (menu_name) updateData.menu_name = menu_name;
        if (order_number !== undefined) updateData.order_number = order_number;
        if (is_active) updateData.is_active = is_active;

        await menu.update(updateData);

        return successResponse(res, menu, "Menu updated successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Delete menu
export const deleteMenu = async (req, res, next) => {
    try {
        const { id } = req.params;

        const menu = await Menu.findByPk(id);

        if (!menu) {
            return errorResponse(res, "Menu not found", 404);
        }

        // Check if menu has children
        const childrenCount = await Menu.count({
            where: { parent_id: id },
        });

        if (childrenCount > 0) {
            return errorResponse(
                res,
                `Cannot delete menu. It has ${childrenCount} child menu(s)`,
                400
            );
        }

        await menu.destroy();

        return successResponse(res, null, "Menu deleted successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Get user's accessible menus based on role
export const getUserMenus = async (req, res, next) => {
    try {
        const { id_roles } = req.user;

        // Get all menus accessible by this role
        const menuAccess = await RoleMenuAccess.findAll({
            where: {
                id_roles: id_roles,
                can_view: true,
            },
            include: [
                {
                    model: Menu,
                    as: "menu",
                    where: { is_active: "active" },
                },
            ],
        });

        // Extract menu IDs
        const menuIds = menuAccess.map((access) => access.id_menus);

        // Build menu tree with only accessible menus
        const buildAccessibleTree = async (parentId = null) => {
            const menus = await Menu.findAll({
                where: {
                    parent_id: parentId,
                    id_menus: { [Op.in]: menuIds },
                    is_active: "active",
                },
                order: [["order_number", "ASC"]],
            });

            const menuTree = [];
            for (const menu of menus) {
                const menuData = menu.toJSON();

                // Get permissions for this menu
                const access = menuAccess.find((a) => a.id_menus === menu.id_menus);
                if (access) {
                    menuData.permissions = {
                        can_view: access.can_view,
                        can_create: access.can_create,
                        can_update: access.can_update,
                        can_delete: access.can_delete,
                    };
                }

                menuData.children = await buildAccessibleTree(menu.id_menus);
                menuTree.push(menuData);
            }

            return menuTree;
        };

        const tree = await buildAccessibleTree();

        return successResponse(res, tree, "User menus retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};