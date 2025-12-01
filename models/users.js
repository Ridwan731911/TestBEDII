import db from "../config/database.js";
import {
    Sequelize
} from "sequelize";
import bcrypt from "bcrypt";

const {
    DataTypes
} = Sequelize;

const User = db.define(
    "users", {
        id_users: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        full_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true,
        },

        is_active: {
            type: DataTypes.ENUM("active", "inactive"),
            allowNull: false,
            defaultValue: "active",
        },
    }, {
        freezeTableName: true,
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

// Instance method untuk compare password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method untuk hide password saat toJSON
User.prototype.toJSON = function () {
    const values = {
        ...this.get()
    };
    delete values.password;
    return values;
};

export default User;