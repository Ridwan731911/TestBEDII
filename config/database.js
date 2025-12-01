import {
    Sequelize
} from "sequelize";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Membuat database jika belum ada
async function createDatabaseIfNotExists() {
    const {
        Pool
    } = pg;

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: "postgres", // connect ke default DB
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        const result = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME]
        );
        if (result.rowCount === 0) {
            console.log(`Database ${process.env.DB_NAME} belum ada. Membuat...`);
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(process.env.DB_NAME)) {
                throw new Error("Invalid database name");
            }

            await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log("Database berhasil dibuat!");
        } else {
            console.log("Database sudah ada");
        }
    } catch (err) {
        console.error("Error saat membuat database:", err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

//Panggil fungsi create DB
await createDatabaseIfNotExists();

//Setup Sequelize
const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        dialectModule: pg, // Fix untuk sequelize + pg di ESM
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: false, // → ganti ke console.log untuk debug SQL
    }
);

export default db;