// Keeps uploaded profile photos safe on hosts whose disk is wiped on every
// restart (e.g. Render's free tier).
//
// Photos are still saved to uploads/profiles exactly as before. This module
// also copies each file into the database (stored_files), and when a photo
// is requested but missing from disk, serves it from the database and puts
// it back on disk. Nothing in the upload controllers changes.
const fs = require("fs");
const path = require("path");
const { db } = require("../../modal/db");

const ROOT = path.join(__dirname, "../..");
const PROFILES_DIR = path.join(ROOT, "uploads/profiles");

const MIME = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
};

let ready = null;

const ensureTable = () => {
    if (!ready) {
        ready = db.promise().query(`
            CREATE TABLE IF NOT EXISTS stored_files (
                path VARCHAR(255) NOT NULL,
                mime VARCHAR(100) NOT NULL,
                data LONGBLOB NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (path)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `).catch((err) => { ready = null; throw err; });
    }
    return ready;
};

// Copy any photo on disk that isn't in the database yet.
const syncToDb = async () => {
    try {
        await ensureTable();
        if (!fs.existsSync(PROFILES_DIR)) return;
        const files = fs.readdirSync(PROFILES_DIR).filter((f) => MIME[path.extname(f).toLowerCase()]);
        if (!files.length) return;

        const urls = files.map((f) => `/uploads/profiles/${f}`);
        const [rows] = await db.promise().query("SELECT path FROM stored_files WHERE path IN (?)", [urls]);
        const have = new Set(rows.map((r) => r.path));

        for (const f of files) {
            const url = `/uploads/profiles/${f}`;
            if (have.has(url)) continue;
            try {
                const data = fs.readFileSync(path.join(PROFILES_DIR, f));
                // execute() sends the photo as raw binary (query() would send it
                // as text, doubling its size against the server's packet limit)
                await db.promise().execute(
                    "INSERT IGNORE INTO stored_files (path, mime, data) VALUES (?, ?, ?)",
                    [url, MIME[path.extname(f).toLowerCase()], data]
                );
            } catch (err) {
                console.error(`Photo backup failed for ${f}:`, err.message);
            }
        }
    } catch (err) {
        console.error("Photo backup to database failed:", err.message);
    }
};

// After any upload request (multipart form) finishes, back up new photos.
const backupAfterUploads = (req, res, next) => {
    if ((req.headers["content-type"] || "").startsWith("multipart/form-data")) {
        res.on("finish", () => { syncToDb(); });
    }
    next();
};

// Mounted after express.static("/uploads"): only reached when the file is
// not on disk. Serves it from the database and restores it to disk.
const serveFromDb = async (req, res, next) => {
    try {
        const url = `/uploads${decodeURIComponent(req.path)}`;
        if (!url.startsWith("/uploads/profiles/") || url.includes("..")) return next();

        await ensureTable();
        const [rows] = await db.promise().query(
            "SELECT mime, data FROM stored_files WHERE path = ? LIMIT 1",
            [url]
        );
        if (!rows.length) return next();

        try {
            fs.mkdirSync(PROFILES_DIR, { recursive: true });
            fs.writeFileSync(path.join(ROOT, url), rows[0].data);
        } catch { /* serving still works without the disk copy */ }

        res.type(rows[0].mime).send(rows[0].data);
    } catch (err) {
        next();
    }
};

module.exports = { syncToDb, backupAfterUploads, serveFromDb };
