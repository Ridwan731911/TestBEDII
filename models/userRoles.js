import db from "../config/database.js";
import {
    Sequelize
} from "sequelize";
import Role from "./roles.js";
import User from "./users.js";

const {
    DataTypes
} = Sequelize;

const UserRole = db.define(
    "user_roles", {
        id_user_roles: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_users: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id_users",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
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

        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        freezeTableName: true,
        tableName: "user_roles",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//association

User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "id_users",
    otherKey: "id_roles",
    as: "roles",
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "id_roles",
    otherKey: "id_users",
    as: "users",
});

UserRole.belongsTo(User, {
    foreignKey: "id_users",
    sourceKey: "id_users",
    as: "user",
});
UserRole.belongsTo(Role, {
    foreignKey: "id_roles",
    sourceKey: "id_roles",
    as: "role",
});
User.hasMany(UserRole, {
    foreignKey: "id_users",
    sourceKey: "id_users",
    as: "user_roles",
});
Role.hasMany(UserRole, {
    foreignKey: "id_roles",
    sourceKey: "id_roles",
    as: "user_roles",
});

export default UserRole;