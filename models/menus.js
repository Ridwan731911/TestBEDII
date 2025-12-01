import db from "../config/database.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Menu = db.define(
    "menus",
    {
        id_menus: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "menus",
                key: "id_menus",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },

        menu_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        order_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

        is_active: {
            type: DataTypes.ENUM("active", "inactive"),
            allowNull: false,
            defaultValue: "active",
        },
    },
    {
        freezeTableName: true,
        tableName: "menus",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        hooks: {
            beforeCreate: async (menu) => {
                // Auto calculate level based on parent
                if (menu.parent_id) {
                    const parent = await Menu.findByPk(menu.parent_id);
                    if (parent) {
                        menu.level = parent.level + 1;
                    }
                }
            },
            beforeUpdate: async (menu) => {
                // Recalculate level if parent changed
                if (menu.changed("parent_id")) {
                    if (menu.parent_id) {
                        const parent = await Menu.findByPk(menu.parent_id);
                        if (parent) {
                            menu.level = parent.level + 1;
                        }
                    } else {
                        menu.level = 1;
                    }
                }
            },
        },
    }
);

export default Menu;