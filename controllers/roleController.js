// src/controllers/roleController.js
import User from "../models/users.js";
import Role from "../models/roles.js";
import Menu from "../models/menus.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { Op } from "sequelize";

// Get all roles with pagination
export const getAllRoles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "", is_active = "" } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { role_name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (is_active) {
            whereClause.is_active = is_active;
        }

        // Get roles
        const { count, rows } = await Role.findAndCountAll({
            where: whereClause,
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
            "Roles retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};

// Get role by ID
export const getRoleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "users",
                    attributes: ["id_users", "username", "full_name"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        return successResponse(res, role, "Role retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Create new role
export const createRole = async (req, res, next) => {
    try {
        const { role_name, description, is_active = "active" } = req.body;

        const role = await Role.create({
            role_name,
            description,
            is_active,
        });

        return successResponse(res, role, "Role created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Update role
export const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role_name, description, is_active } = req.body;

        const role = await Role.findByPk(id);

        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        // Update role
        const updateData = {};
        if (role_name) updateData.role_name = role_name;
        if (description) updateData.description = description;
        if (is_active) updateData.is_active = is_active;

        await role.update(updateData);

        return successResponse(res, role, "Role updated successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Delete role
export const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await Role.findByPk(id);

        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        // Check if role is assigned to users
        const usersCount = await role.countUsers();

        if (usersCount > 0) {
            return errorResponse(
                res,
                `Cannot delete role. It is assigned to ${usersCount} user(s)`,
                400
            );
        }

        await role.destroy();

        return successResponse(res, null, "Role deleted successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Get role's users
export const getRoleUsers = async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "users",
                    attributes: { exclude: ["password"] },
                    through: {
                        attributes: ["is_default"],
                    },
                },
            ],
        });

        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        return successResponse(res, role.users, "Role users retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Get role's menu access
export const getRoleMenuAccess = async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: Menu,
                    as: "menus",
                    through: {
                        attributes: ["can_view", "can_create", "can_update", "can_delete"],
                    },
                },
            ],
        });

        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        return successResponse(
            res,
            role.menus,
            "Role menu access retrieved successfully",
            200
        );
    } catch (error) {
        next(error);
    }
};