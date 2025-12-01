import db from "../config/database.js";
import { Sequelize } from "sequelize";
import Role from "./roles.js";
import Menu from "./menus.js";

const { DataTypes } = Sequelize;

const RoleMenuAccess = db.define(
    "role_menu_access",
    {
        id_role_menu_access: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_roles: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Role,
                key: "id_roles",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },

        id_menus: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Menu,
                key: "id_menus",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },

        can_view: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        can_create: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_update: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_delete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        freezeTableName: true,
        tableName: "role_menu_access",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//association
RoleMenuAccess.belongsTo(Role, {
    foreignKey: "id_roles",
    sourceKey: "id_roles",
    as: "role",
});

RoleMenuAccess.belongsTo(Menu, {
    foreignKey: "id_menus",
    sourceKey: "id_menus",
    as: "menu",
});

Role.hasMany(RoleMenuAccess, {
    foreignKey: "id_roles",
    sourceKey: "id_roles",
    as: "role_menu_accesses",
});

Menu.hasMany(RoleMenuAccess, {
    foreignKey: "id_menus",
    sourceKey: "id_menus",
    as: "role_menu_accesses",
});

export default RoleMenuAccess;