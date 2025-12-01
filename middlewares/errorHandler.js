// src/middlewares/errorHandler.js

export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Sequelize Validation Error
    if (err.name === "SequelizeValidationError") {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));

        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors,
        });
    }

    // Sequelize Unique Constraint Error
    if (err.name === "SequelizeUniqueConstraintError") {
        const field = err.errors[0].path;
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // Sequelize Foreign Key Constraint Error
    if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
            success: false,
            message: "Foreign key constraint error",
        });
    }

    // JWT Error
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};