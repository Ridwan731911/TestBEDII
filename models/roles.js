import db from "../config/database.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Role = db.define(
    "roles",
    {
        id_roles: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        role_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        is_active: {
            type: DataTypes.ENUM("active", "inactive"),
            allowNull: false,
            defaultValue: "active",
        },
    },
    {
        freezeTableName: true,
        tableName: "roles",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Role;