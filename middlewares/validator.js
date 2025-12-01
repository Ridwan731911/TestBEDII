// src/middlewares/validator.js
import { errorResponse } from "../utils/response.js";

// Validate login request
export const validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || username.trim() === "") {
        errors.push({ field: "username", message: "Username is required" });
    }

    if (!password || password.trim() === "") {
        errors.push({ field: "password", message: "Password is required" });
    }

    if (errors.length > 0) {
        return errorResponse(res, "Validation error", 400, errors);
    }

    next();
};

// Validate select role request
export const validateSelectRole = (req, res, next) => {
    const { id_roles } = req.body;
    const errors = [];

    if (!id_roles) {
        errors.push({ field: "id_roles", message: "Role ID is required" });
    }

    if (errors.length > 0) {
        return errorResponse(res, "Validation error", 400, errors);
    }

    next();
};

// Validate create user
export const validateCreateUser = (req, res, next) => {
    const { username, password, full_name } = req.body;
    const errors = [];

    if (!username || username.trim() === "") {
        errors.push({ field: "username", message: "Username is required" });
    }

    if (!password || password.trim() === "") {
        errors.push({ field: "password", message: "Password is required" });
    } else if (password.length < 6) {
        errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }

    if (!full_name || full_name.trim() === "") {
        errors.push({ field: "full_name", message: "Full name is required" });
    }

    if (errors.length > 0) {
        return errorResponse(res, "Validation error", 400, errors);
    }

    next();
};

// Validate create role
export const validateCreateRole = (req, res, next) => {
    const { role_name } = req.body;
    const errors = [];

    if (!role_name || role_name.trim() === "") {
        errors.push({ field: "role_name", message: "Role name is required" });
    }

    if (errors.length > 0) {
        return errorResponse(res, "Validation error", 400, errors);
    }

    next();
};

// Validate create menu
export const validateCreateMenu = (req, res, next) => {
    const { menu_name } = req.body;
    const errors = [];

    if (!menu_name || menu_name.trim() === "") {
        errors.push({ field: "menu_name", message: "Menu name is required" });
    }

    if (errors.length > 0) {
        return errorResponse(res, "Validation error", 400, errors);
    }

    next();
};

// Validate assign role menu access
export const validateAssignAccess = (req, res, next) => {
    const { id_roles, id_menus } = req.body;
    const errors = [];

    if (!id_roles) {
        errors.push({ field: "id_roles", message: "Role ID is required" });
    }

    if (!id_menus) {
        errors.push({ field: "id_menus", message: "Menu ID is required" });
    }

    if (errors.length > 0) {
        return errorResponse(res, "Validation error", 400, errors);
    }

    next();
};