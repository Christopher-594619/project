// One-off CLI to bootstrap an admin account. Admins are never created through
// the public signup form, so this is the only way to mint the first one.
//
// Usage:
//   node scripts/createAdmin.js admin@example.com "StrongPassword123" "0977000000"
//
// Re-running with an existing email promotes that account to admin instead
// of failing, so it also doubles as "make this existing user an admin".

require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../modal/db');


const [, , email, password, phone] = process.argv;

if (!email || !password) {
    console.error('Usage: node scripts/createAdmin.js <email> <password> [phone]');
    process.exit(1);
}

if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
}

const run = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const [existing] = await db.promise().query(
            'SELECT id, role FROM users WHERE email = ? LIMIT 1',
            [normalizedEmail]
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        if (existing.length > 0) {
            await db.promise().query(
                'UPDATE users SET role = ?, password = ?, is_suspended = FALSE WHERE id = ?',
                ['admin', hashedPassword, existing[0].id]
            );
            console.log(`Promoted existing user ${normalizedEmail} to admin.`);
        } else {
            const id = uuidv4();
            await db.promise().query(
                `INSERT INTO users (id, email, phone, password, role)
                 VALUES (?, ?, ?, ?, 'admin')`,
                [id, normalizedEmail, phone || '0000000000', hashedPassword]
            );
            console.log(`Created new admin account ${normalizedEmail}.`);
        }
    } catch (error) {
        console.error('Failed to create admin:', error.message);
        process.exitCode = 1;
    } finally {
        db.end();
    }
};

run();
