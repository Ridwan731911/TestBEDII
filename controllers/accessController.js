import RoleMenuAccess from "../models/roleMenuAccess.js";
import Role from "../models/roles.js";
import Menu from "../models/menus.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";

// Get all role menu access with pagination
export const getAllAccess = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, id_roles = "", id_menus = "" } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (id_roles) {
            whereClause.id_roles = id_roles;
        }

        if (id_menus) {
            whereClause.id_menus = id_menus;
        }

        // Get access
        const { count, rows } = await RoleMenuAccess.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["id_roles", "role_name"],
                },
                {
                    model: Menu,
                    as: "menu",
                    attributes: ["id_menus", "menu_name"],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["created_at", "DESC"]],
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
            "Access list retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};

// Get access by ID
export const getAccessById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const access = await RoleMenuAccess.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: "role",
                },
                {
                    model: Menu,
                    as: "menu",
                },
            ],
        });

        if (!access) {
            return errorResponse(res, "Access not found", 404);
        }

        return successResponse(res, access, "Access retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Assign menu access to role
export const assignAccess = async (req, res, next) => {
    try {
        const {
            id_roles,
            id_menus,
            can_view = true,
            can_create = false,
            can_update = false,
            can_delete = false,
        } = req.body;

        // Check if role exists
        const role = await Role.findByPk(id_roles);
        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        // Check if menu exists
        const menu = await Menu.findByPk(id_menus);
        if (!menu) {
            return errorResponse(res, "Menu not found", 404);
        }

        // Check if access already exists
        const existingAccess = await RoleMenuAccess.findOne({
            where: {
                id_roles,
                id_menus,
            },
        });

        if (existingAccess) {
            return errorResponse(res, "Access already exists for this role and menu", 400);
        }

        // Create access
        const access = await RoleMenuAccess.create({
            id_roles,
            id_menus,
            can_view,
            can_create,
            can_update,
            can_delete,
        });

        return successResponse(res, access, "Access assigned successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Update menu access
export const updateAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { can_view, can_create, can_update, can_delete } = req.body;

        const access = await RoleMenuAccess.findByPk(id);

        if (!access) {
            return errorResponse(res, "Access not found", 404);
        }

        // Update access
        const updateData = {};
        if (can_view !== undefined) updateData.can_view = can_view;
        if (can_create !== undefined) updateData.can_create = can_create;
        if (can_update !== undefined) updateData.can_update = can_update;
        if (can_delete !== undefined) updateData.can_delete = can_delete;

        await access.update(updateData);

        return successResponse(res, access, "Access updated successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Delete menu access
export const deleteAccess = async (req, res, next) => {
    try {
        const { id } = req.params;

        const access = await RoleMenuAccess.findByPk(id);

        if (!access) {
            return errorResponse(res, "Access not found", 404);
        }

        await access.destroy();

        return successResponse(res, null, "Access deleted successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Bulk assign menu access to role
export const bulkAssignAccess = async (req, res, next) => {
    try {
        const { id_roles, menus } = req.body;

        // menus format: [{ id_menus, can_view, can_create, can_update, can_delete }]

        if (!Array.isArray(menus) || menus.length === 0) {
            return errorResponse(res, "Menus array is required and cannot be empty", 400);
        }

        // Check if role exists
        const role = await Role.findByPk(id_roles);
        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        const createdAccess = [];
        const errors = [];

        for (const menuData of menus) {
            try {
                const { id_menus, can_view = true, can_create = false, can_update = false, can_delete = false } = menuData;

                // Check if menu exists
                const menu = await Menu.findByPk(id_menus);
                if (!menu) {
                    errors.push({ id_menus, error: "Menu not found" });
                    continue;
                }

                // Check if access already exists
                const existingAccess = await RoleMenuAccess.findOne({
                    where: { id_roles, id_menus },
                });

                if (existingAccess) {
                    // Update existing access
                    await existingAccess.update({
                        can_view,
                        can_create,
                        can_update,
                        can_delete,
                    });
                    createdAccess.push(existingAccess);
                } else {
                    // Create new access
                    const access = await RoleMenuAccess.create({
                        id_roles,
                        id_menus,
                        can_view,
                        can_create,
                        can_update,
                        can_delete,
                    });
                    createdAccess.push(access);
                }
            } catch (error) {
                errors.push({ id_menus: menuData.id_menus, error: error.message });
            }
        }

        return successResponse(
            res,
            {
                success_count: createdAccess.length,
                error_count: errors.length,
                created: createdAccess,
                errors: errors.length > 0 ? errors : undefined,
            },
            "Bulk access assignment completed",
            201
        );
    } catch (error) {
        next(error);
    }
};

// Remove all menu access for a role
export const removeAllRoleAccess = async (req, res, next) => {
    try {
        const { roleId } = req.params;

        // Check if role exists
        const role = await Role.findByPk(roleId);
        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        // Delete all access for this role
        const deletedCount = await RoleMenuAccess.destroy({
            where: { id_roles: roleId },
        });

        return successResponse(
            res,
            { deleted_count: deletedCount },
            `All access for role removed successfully (${deletedCount} records deleted)`,
            200
        );
    } catch (error) {
        next(error);
    }
};