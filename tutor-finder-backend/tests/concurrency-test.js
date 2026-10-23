// Concurrency test for bookings and payments.
//
// Fires N identical requests at the same moment and then checks the
// database, to see whether the server's checks hold when requests overlap
// (a sequential test cannot show this).
//
//   node tests/concurrency-test.js <api-base-url> [N] [label]
//   e.g. node tests/concurrency-test.js http://localhost:5099 10 before-fix
//
// Uses the database named in the environment (DB_*), signs test tokens with
// ACCESS_SECRET, tags every record with subject CONCURRENCY-TEST and deletes
// them all at the end. Results are written to tests/results/<label>.json.
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const BASE = (process.argv[2] || "http://localhost:5099").replace(/\/+$/, "");
const N = Number(process.argv[3] || 10);
const LABEL = process.argv[4] || "run";

const STUDENT = "5da5d94d-f718-43ac-8b97-180964a3d8b1"; // Subira Makayi
const TUTOR = "c13b3bc6-6331-439a-91b7-4827e70b67dd";   // Kuwunda Makayi
const TAG = "CONCURRENCY-TEST";

const token = (userId, role) =>
    jwt.sign({ userId, role }, process.env.ACCESS_SECRET, { expiresIn: "10m" });
const ST = token(STUDENT, "student");
const TU = token(TUTOR, "tutor");

const call = async (method, url, auth, body) => {
    const t0 = Date.now();
    const res = await fetch(BASE + url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` },
        body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty body */ }
    return { status: res.status, ms: Date.now() - t0, body: json };
};

const summarise = (responses) => {
    const byStatus = {};
    for (const r of responses) {
        const key = `${r.status} ${r.body?.message || r.body?.transaction?.status || ""}`.trim();
        byStatus[key] = (byStatus[key] || 0) + 1;
    }
    return byStatus;
};

(async () => {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
    const report = { label: LABEL, api: BASE, simultaneousRequests: N, at: new Date().toISOString() };

    try {
        // ---------- Test 1: N students-worth of identical bookings at once ----------
        const slot = { tutorId: TUTOR, subject: TAG, date: "2026-12-30", time: "10:00 AM", duration: 60 };
        const bookingResponses = await Promise.all(
            Array.from({ length: N }, () => call("POST", "/api/bookings", ST, slot))
        );
        const [bookingRows] = await db.query(
            "SELECT id, status FROM bookings WHERE subject = ? AND date = ? AND time = ?",
            [TAG, slot.date, slot.time]
        );
        report.booking = {
            description: `${N} simultaneous requests for the same tutor, date and time`,
            expected: "exactly 1 booking created, the rest rejected as a clash",
            responses: summarise(bookingResponses),
            bookingsInDatabase: bookingRows.length,
            passed: bookingRows.length === 1,
        };

        // ---------- Test 2: N payments for the same booking at once ----------
        const pay = await call("POST", "/api/bookings", ST, { ...slot, date: "2026-12-31" });
        const bookingId = pay.body?.booking?.id;
        await call("PATCH", `/api/bookings/${bookingId}`, TU, { status: "confirmed" });

        const paymentResponses = await Promise.all(
            Array.from({ length: N }, () =>
                call("POST", "/api/payments/initiate", ST, {
                    booking_id: bookingId, provider: "mtn", msisdn: "0977123456",
                })
            )
        );
        const [tx] = await db.query(
            "SELECT status, COUNT(*) n FROM transactions WHERE booking_id = ? GROUP BY status",
            [bookingId]
        );
        const [[rc]] = await db.query(
            "SELECT COUNT(*) n FROM receipts r JOIN transactions t ON t.id = r.transaction_id WHERE t.booking_id = ?",
            [bookingId]
        );
        const counts = Object.fromEntries(tx.map((r) => [r.status, Number(r.n)]));
        report.payment = {
            description: `${N} simultaneous payment requests for one confirmed booking`,
            expected: "at most 1 completed transaction and at most 1 receipt",
            responses: summarise(paymentResponses),
            transactionsInDatabase: counts,
            receiptsInDatabase: Number(rc.n),
            passed: (counts.completed || 0) <= 1 && Number(rc.n) <= 1,
        };
    } finally {
        const [del] = await db.query("DELETE FROM bookings WHERE subject = ?", [TAG]);
        report.cleanup = `deleted ${del.affectedRows} test bookings (and their transactions and receipts)`;
        await db.end();
    }

    const out = path.join(__dirname, "results", `${LABEL}.json`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(1); });
