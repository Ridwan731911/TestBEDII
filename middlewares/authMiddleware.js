// src/middlewares/authMiddleware.js
import { verifyAccessToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";
import User from "../models/users.js";
import Role from "../models/roles.js";
import UserRole from "../models/userRoles.js";

// Middleware untuk verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return errorResponse(res, "Access token is required", 401);
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user data
        const user = await User.findByPk(decoded.id_users, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        if (user.is_active !== "active") {
            return errorResponse(res, "User is not active", 403);
        }

        // Attach user to request
        req.user = {
            id_users: user.id_users,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            id_roles: decoded.id_roles,
            role_name: decoded.role_name,
        };

        next();
    } catch (error) {
        if (error.message === "Invalid or expired access token") {
            return errorResponse(res, "Invalid or expired token", 401);
        }
        return errorResponse(res, error.message, 500);
    }
};

// Middleware untuk check role permission
export const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role_name) {
            return errorResponse(res, "User role not found", 403);
        }

        const hasRole = allowedRoles.includes(req.user.role_name);

        if (!hasRole) {
            return errorResponse(
                res,
                `Access denied. Required roles: ${allowedRoles.join(", ")}`,
                403
            );
        }

        next();
    };
};

// Middleware untuk check menu permission
export const checkMenuPermission = (action = "view") => {
    return async (req, res, next) => {
        try {
            const { id_roles } = req.user;
            const menuUrl = req.baseUrl + req.path;

            // Import RoleMenuAccess dan Menu
            const { RoleMenuAccess, Menu } = await import("../models/index.js");

            // Find menu by URL
            const menu = await Menu.findOne({
                where: { menu_url: menuUrl },
            });

            if (!menu) {
                return next(); // Menu tidak ditemukan, lanjutkan
            }

            // Check permission
            const access = await RoleMenuAccess.findOne({
                where: {
                    id_roles: id_roles,
                    id_menus: menu.id_menus,
                },
            });

            if (!access) {
                return errorResponse(res, "You don't have access to this menu", 403);
            }

            // Check specific permission
            const permissionMap = {
                view: access.can_view,
                create: access.can_create,
                update: access.can_update,
                delete: access.can_delete,
            };

            if (!permissionMap[action]) {
                return errorResponse(
                    res,
                    `You don't have permission to ${action} this resource`,
                    403
                );
            }

            next();
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    };
};