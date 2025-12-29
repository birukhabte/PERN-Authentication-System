import jwt from "jsonwebtoken";

import pool from "../config/db";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = user.rows[0];
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: "Unauthorized" });
    }
}
