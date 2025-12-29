import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";


const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    //Register Route
    router.post("/register", async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const userExists = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hashedPassword]
        );
        const token = generateToken(result.rows[0].id);
        res.cookie("token", token, cookieOptions);
        res.status(201).json({ user: newUser.rows[0] });
    })

    //Login Route
    router.post("/login", async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = generateToken(user.rows[0].id);
        res.cookie("token", token, cookieOptions);
        res.status(200).json({ user: user.rows[0] });
    })
    // Me
    router.get("/me", (req, res) => {
        res.json({ user: req.user });
        // return info of the logged in user from protect middleware
    });
    // Logout Route
    router.post("/logout", (req, res) => {
        res.cookie("token", "", cookieOptions);
        res.status(200).json({ message: "Logout successful" });
    })


};
export default router;