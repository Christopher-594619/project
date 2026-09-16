const bcrypt = require("bcrypt");
const {db} = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");

// Create register endpoint
const signup = async (req, res) => {

    const id = uuidv4();
    
    try {
        const {email, phone, password } = req.body;

        if (!email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Check if email already exists
        const [existingEmail] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase()]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Check if phone already exists
        const [existingPhone] = await db.promise().query(
            "SELECT id FROM users WHERE phone = ?",
            [phone]
        );

        if (existingPhone.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }
                
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.promise().query(
            `
            INSERT INTO users
            (id, email, phone, password, role)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                id,
                email.toLowerCase(),
                phone,
                hashedPassword,
                "student"
            ]
        );

        // Get inserted user
        const [insertedUser] = await db.promise().query(
            "SELECT id, email, phone, role FROM users WHERE id = ?",
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Successfully registered",
            user: insertedUser[0]
        });

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { signup };