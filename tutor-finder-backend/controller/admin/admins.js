const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../../modal/db");

// ==================== LIST ADMINS (ADMIN) ====================
const getAdmins = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `
            SELECT id, email, phone, CONCAT_WS(' ', firstName, lastName) AS name, created_at
            FROM users
            WHERE role = 'admin'
            ORDER BY created_at ASC
            `
        );

        return res.status(200).json({
            success: true,
            admins: rows
        });
    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ==================== CREATE ADMIN (ADMIN) ====================
// Only an existing admin can reach this (see routes/admin.js). It refuses
// emails/phones that already belong to an account rather than promoting them,
// so it can never silently take over or reset someone else's login.
const createAdmin = async (req, res) => {
    try {
        let { email, phone, password, name } = req.body;

        if (!email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, phone and password are required"
            });
        }

        email = email.trim().toLowerCase();
        phone = phone.trim();
        name = name ? name.trim() : null;
        // users stores firstName/lastName, not a single name column.
        const [firstName = null, ...rest] = name ? name.split(/\s+/) : [];
        const lastName = rest.length ? rest.join(" ") : null;

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const [existing] = await db.promise().query(
            "SELECT email, phone FROM users WHERE email = ? OR phone = ? LIMIT 1",
            [email, phone]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: existing[0].email === email
                    ? "Email already registered"
                    : "Phone number already registered"
            });
        }

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
            `
            INSERT INTO users (id, email, phone, firstName, lastName, password, role)
            VALUES (?, ?, ?, ?, ?, ?, 'admin')
            `,
            [id, email, phone, firstName, lastName, hashedPassword]
        );

        const [rows] = await db.promise().query(
            "SELECT id, email, phone, CONCAT_WS(' ', firstName, lastName) AS name, created_at FROM users WHERE id = ?",
            [id]
        );

        return res.status(201).json({
            success: true,
            message: "Admin account created",
            admin: rows[0]
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getAdmins, createAdmin };
