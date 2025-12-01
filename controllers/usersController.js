import User from "../models/users.js";
import Role from "../models/roles.js";
import UserRole from "../models/userRoles.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { Op } from "sequelize";

// Get all users with pagination and search
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "", is_active = "" } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (is_active) {
            whereClause.is_active = is_active;
        }

        // Get users
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: Role,
                    as: "roles",
                    through: {
                        attributes: ["is_default"],
                    },
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
            "Users retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: Role,
                    as: "roles",
                    through: {
                        attributes: ["is_default"],
                    },
                },
            ],
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        return successResponse(res, user, "User retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Create new user
export const createUser = async (req, res, next) => {
    try {
        const { username, password, full_name, email, is_active = "active" } = req.body;

        // Create user
        const user = await User.create({
            username,
            password,
            full_name,
            email,
            is_active,
        });

        return successResponse(
            res,
            {
                id_users: user.id_users,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                is_active: user.is_active,
            },
            "User created successfully",
            201
        );
    } catch (error) {
        next(error);
    }
};

// Update user
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, email, is_active } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        // Update user
        const updateData = {};
        if (username) updateData.username = username;
        if (password) updateData.password = password;
        if (full_name) updateData.full_name = full_name;
        if (email) updateData.email = email;
        if (is_active) updateData.is_active = is_active;

        await user.update(updateData);

        return successResponse(
            res,
            {
                id_users: user.id_users,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                is_active: user.is_active,
            },
            "User updated successfully",
            200
        );
    } catch (error) {
        next(error);
    }
};

// Delete user
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        await user.destroy();

        return successResponse(res, null, "User deleted successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Assign role to user
export const assignRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_roles, is_default = false } = req.body;

        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        // Check if role exists
        const role = await Role.findByPk(id_roles);
        if (!role) {
            return errorResponse(res, "Role not found", 404);
        }

        // Check if user already has this role
        const existingUserRole = await UserRole.findOne({
            where: {
                id_users: id,
                id_roles: id_roles,
            },
        });

        if (existingUserRole) {
            return errorResponse(res, "User already has this role", 400);
        }

        // If is_default is true, set other roles to false
        if (is_default) {
            await UserRole.update(
                { is_default: false },
                {
                    where: { id_users: id },
                }
            );
        }

        // Assign role
        await UserRole.create({
            id_users: id,
            id_roles: id_roles,
            is_default,
        });

        return successResponse(res, null, "Role assigned to user successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Remove role from user
export const removeRole = async (req, res, next) => {
    try {
        const { id, roleId } = req.params;

        const userRole = await UserRole.findOne({
            where: {
                id_users: id,
                id_roles: roleId,
            },
        });

        if (!userRole) {
            return errorResponse(res, "User does not have this role", 404);
        }

        await userRole.destroy();

        return successResponse(res, null, "Role removed from user successfully", 200);
    } catch (error) {
        next(error);
    }
};

// Get user's roles
export const getUserRoles = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: "roles",
                    through: {
                        attributes: ["is_default"],
                    },
                },
            ],
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        return successResponse(res, user.roles, "User roles retrieved successfully", 200);
    } catch (error) {
        next(error);
    }
};