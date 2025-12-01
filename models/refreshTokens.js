import db from "../config/database.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const RefreshToken = db.define(
    "refresh_tokens",
    {
        id_refresh_tokens: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_users: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id_users",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },

        token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

    },
    {
        freezeTableName: true,
        tableName: "refresh_tokens",
        timestamps: true,
        createdAt: "created_at",
    }
);

RefreshToken.prototype.isExpired = function () {
    return new Date() > this.expires_at;
};


export default RefreshToken;