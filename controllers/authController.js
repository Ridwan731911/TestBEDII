import User from "../models/users.js";
import Role from "../models/roles.js";
import UserRole from "../models/userRoles.js";
import {
    successResponse,
    errorResponse
} from "../utils/response.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getRefreshTokenExpiry,
} from "../utils/jwt.js";
import RefreshToken from "../models/refreshTokens.js";

// Login
export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            where: { username },
            include: [
                {
                    model: Role,
                    as: "roles",
                    through: {
                        attributes: ["is_default"],
                        as: "userRole",  // kasih alias pivot
                    },
                },
            ],
        });

        if (!user) {
            return errorResponse(res, "Invalid username or password", 401);
        }

        if (user.is_active !== "active") {
            return errorResponse(res, "Your account is not active", 403);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse(res, "Invalid username or password", 401);
        }

        if (user.roles.length === 0) {
            return errorResponse(res, "User has no assigned roles", 403);
        }

        // Single role
        if (user.roles.length === 1) {
            const role = user.roles[0];

            const accessToken = generateAccessToken({
                id_users: user.id_users,
                username: user.username,
                id_roles: role.id_roles,
                role_name: role.role_name,
            });

            const refreshToken = generateRefreshToken({
                id_users: user.id_users,
            });

            await RefreshToken.create({
                id_users: user.id_users,
                token: refreshToken,
                expires_at: getRefreshTokenExpiry(),
            });

            return successResponse(
                res,
                {
                    user: {
                        id_users: user.id_users,
                        username: user.username,
                        full_name: user.full_name,
                        email: user.email,
                    },
                    role: {
                        id_roles: role.id_roles,
                        role_name: role.role_name,
                    },
                    access_token: accessToken,
                    refresh_token: refreshToken,
                },
                "Login successful",
                200
            );
        }

        // Multiple roles
        return successResponse(
            res,
            {
                user: {
                    id_users: user.id_users,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                },
                roles: user.roles.map((role) => ({
                    id_roles: role.id_roles,
                    role_name: role.role_name,
                    is_default: role.userRole?.is_default ?? false, // lebih aman
                })),
                requires_role_selection: true,
            },
            "Please select a role to continue",
            200
        );

    } catch (error) {
        next(error);
    }
};


// Select Role (for users with multiple roles)
export const selectRole = async (req, res, next) => {
    try {
        const {
            id_users,
            id_roles
        } = req.body;

        // Verify user has this role
        const userRole = await UserRole.findOne({
            where: {
                id_users,
                id_roles
            },
            include: [{
                    model: User,
                    as: "user",
                },
                {
                    model: Role,
                    as: "role",
                },
            ],
        });

        if (!userRole) {
            return errorResponse(res, "User does not have this role", 403);
        }

        const user = userRole.user;
        const role = userRole.role;

        // Generate tokens
        const accessToken = generateAccessToken({
            id_users: user.id_users,
            username: user.username,
            id_roles: role.id_roles,
            role_name: role.role_name,
        });

        const refreshToken = generateRefreshToken({
            id_users: user.id_users,
        });

        // Save refresh token to database
        await RefreshToken.create({
            id_users: user.id_users,
            token: refreshToken,
            expires_at: getRefreshTokenExpiry(),
        });

        return successResponse(
            res, {
                user: {
                    id_users: user.id_users,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                },
                role: {
                    id_roles: role.id_roles,
                    role_name: role.role_name,
                },
                access_token: accessToken,
                refresh_token: refreshToken,
            },
            "Role selected successfully",
            200
        );
    } catch (error) {
        next(error);
    }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
    try {
        const {
            refresh_token
        } = req.body;

        if (!refresh_token) {
            return errorResponse(res, "Refresh token is required", 400);
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refresh_token);

        // Check if token exists in database
        const tokenRecord = await RefreshToken.findOne({
            where: {
                token: refresh_token,
                id_users: decoded.id_users,
            },
        });

        if (!tokenRecord) {
            return errorResponse(res, "Invalid refresh token", 401);
        }

        // Check if token is expired
        if (tokenRecord.isExpired()) {
            await tokenRecord.destroy();
            return errorResponse(res, "Refresh token has expired", 401);
        }

        // Get user with default role
        const user = await User.findByPk(decoded.id_users, {
            include: [{
                model: Role,
                as: "roles",
                through: {
                    where: {
                        is_default: true
                    },
                    attributes: [],
                },
            }, ],
        });

        if (!user || user.roles.length === 0) {
            return errorResponse(res, "User not found or has no default role", 404);
        }

        const role = user.roles[0];

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id_users: user.id_users,
            username: user.username,
            id_roles: role.id_roles,
            role_name: role.role_name,
        });

        return successResponse(
            res, {
                access_token: newAccessToken,
            },
            "Token refreshed successfully",
            200
        );
    } catch (error) {
        next(error);
    }
};

// Logout
export const logout = async (req, res, next) => {
    try {
        const {
            refresh_token
        } = req.body;

        if (refresh_token) {
            // Delete refresh token from database
            await RefreshToken.destroy({
                where: {
                    token: refresh_token
                },
            });
        }

        return successResponse(res, null, "Logout successful", 200);
    } catch (error) {
        next(error);
    }
};

// Get Current User Info
export const me = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id_users, {
            attributes: {
                exclude: ["password"]
            },
            include: [{
                model: Role,
                as: "roles",
                through: {
                    attributes: ["is_default"],
                },
            }, ],
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        return successResponse(
            res, {
                user: user.toJSON(),
                current_role: {
                    id_roles: req.user.id_roles,
                    role_name: req.user.role_name,
                },
            },
            "User info retrieved successfully",
            200
        );
    } catch (error) {
        next(error);
    }
};