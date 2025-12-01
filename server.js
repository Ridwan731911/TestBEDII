import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/database.js";
import morgan from 'morgan';

import mainRouter from './routes/index.js';
import authRoutes from "./routes/authRoutes.js";

import Role from "./models/roles.js";
import User from "./models/users.js";
import UserRole from './models/userRoles.js';
import RoleMenuAccess from './models/roleMenuAccess.js';
import Menu from "./models/menus.js";
import RefreshToken from './models/refreshTokens.js';

import { authenticateToken } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

/* -------------------- PUBLIC ROUTES -------------------- */
app.use("/api/auth", authRoutes);     // ✔ login tidak butuh token
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

/* -------------------- PRIVATE ROUTES -------------------- */
app.use("/api", mainRouter);

/* -------------------- DATABASE INIT -------------------- */
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log("📦 Database connected successfully!");

        await Role.sync();
        await User.sync();
        await UserRole.sync();
        await Menu.sync();
        await RoleMenuAccess.sync();
        await RefreshToken.sync();

        console.log("📄 Models synchronized!");
    } catch (err) {
        console.error("❌ Database connection error:", err.message);
    }
}

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
}

startServer();
