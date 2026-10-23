// Evidence for the report: runs the critical booking, payment, review and
// access-control tests one by one, recording the actual API responses and the
// resulting database rows, then measures response times.
//
//   node tests/evidence-test.js <api-base-url>
//
// Uses the database named in the environment (DB_*). Every record created is
// tagged EVIDENCE-TEST and deleted at the end. Output: tests/results/evidence.json
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");

const BASE = (process.argv[2] || "http://localhost:5099").replace(/\/+$/, "");
const STUDENT = "5da5d94d-f718-43ac-8b97-180964a3d8b1"; // Subira Makayi
const OTHER_STUDENT = "10d3d992-2b77-475b-abee-dec0d407475d";
const TUTOR = "c13b3bc6-6331-439a-91b7-4827e70b67dd";   // Kuwunda Makayi
const TUTOR2 = "08bfe6fe-e298-4dbe-8db5-35369861136b";  // Celine Soko
const TAG = "EVIDENCE-TEST";

const tok = (userId, role) => jwt.sign({ userId, role }, process.env.ACCESS_SECRET, { expiresIn: "15m" });
const ST = tok(STUDENT, "student"), OS = tok(OTHER_STUDENT, "student");
const TU = tok(TUTOR, "tutor"), T2 = tok(TUTOR2, "tutor");

const call = async (method, url, auth, body) => {
    const t0 = performance.now();
    const res = await fetch(BASE + url, {
        method,
        headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* none */ }
    return { status: res.status, ms: Math.round(performance.now() - t0), body: json };
};
const brief = (r) => ({ status: r.status, message: r.body?.message, ...(r.body?.transaction ? {
    transaction: (({ id, status, amount, platform_fee, tutor_payout, failure_reason, receipt }) =>
        ({ id, status, amount, platform_fee, tutor_payout, failure_reason, receipt_number: receipt?.receipt_number }))(r.body.transaction) } : {}) });

const results = [];
const record = (id, name, expected, observed, passed) => {
    results.push({ id, name, expected, observed, passed });
    console.log(`${passed ? "PASS" : "FAIL"}  ${id}  ${name}`);
};

(async () => {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined, dateStrings: true,
    });
    const book = (auth, tutorId, date, time, duration = 90) =>
        call("POST", "/api/bookings", auth, { tutorId, subject: TAG, date, time, duration, price: 1 });

    try {
        // ---------- Booking ----------
        const b1 = await book(ST, TUTOR, "2027-01-11", "10:00 AM");
        const b1id = b1.body?.booking?.id;
        const [[tp]] = await db.query("SELECT price FROM tutor_profiles WHERE user_id = ?", [TUTOR]);
        const [[b1row]] = await db.query("SELECT price, duration, status FROM bookings WHERE id = ?", [b1id]);
        record("B1", "Server-side pricing ignores a tampered price",
            `booking stored at the tutor's rate (K${tp.price}/h), not the K1 sent`,
            { response: brief(b1), databaseRow: b1row }, Number(b1row.price) === Number(tp.price));

        const b2 = await book(ST, TUTOR, "2027-01-11", "11:00 AM", 60);
        record("B2", "Overlapping booking for the same tutor is rejected",
            "409 clash; no second booking stored", { response: brief(b2) }, b2.status === 409);

        const b3 = await book(ST, TUTOR, "2026-01-05", "9:00 AM");
        record("B3", "Booking in the past is rejected", "400", { response: brief(b3) }, b3.status === 400);

        const b4 = await call("PATCH", `/api/bookings/${b1id}`, TU, { status: "completed" });
        record("B4", "Pending booking cannot jump to completed", "400", { response: brief(b4) }, b4.status === 400);

        const b5 = await call("PATCH", `/api/bookings/${b1id}`, ST, { status: "confirmed" });
        record("B5", "Student cannot confirm a booking", "403", { response: brief(b5) }, b5.status === 403);

        await call("PATCH", `/api/bookings/${b1id}`, TU, { status: "confirmed" });

        // ---------- Payment ----------
        const p0 = await call("POST", "/api/payments/initiate", OS, { booking_id: b1id, provider: "mtn", msisdn: "0977123456" });
        record("S1", "Another student cannot pay for this booking", "400 doesn't belong", { response: brief(p0) },
            p0.status === 400 && /belong/i.test(p0.body?.message || ""));

        const pT = await call("POST", "/api/payments/initiate", TU, { booking_id: b1id, provider: "mtn", msisdn: "0977123456" });
        record("S2", "A tutor cannot start a payment", "403", { response: brief(pT) }, pT.status === 403);

        const pN = await call("POST", "/api/payments/initiate", null, { booking_id: b1id, provider: "mtn", msisdn: "0977123456" });
        record("S3", "No login token is rejected", "401", { response: brief(pN) }, pN.status === 401);

        const p1 = await call("POST", "/api/payments/initiate", ST, { booking_id: b1id, provider: "airtel", msisdn: "0977120000" });
        let p2;
        for (let i = 0; i < 6; i++) {
            p2 = await call("POST", `/api/payments/${p1.body?.transaction?.id}/retry`, ST, { msisdn: "0977123456" });
            if (p2.body?.transaction?.status === "completed") break;
        }
        const [txRows] = await db.query(
            "SELECT id, status, amount, platform_fee, tutor_payout, failure_reason FROM transactions WHERE booking_id = ? ORDER BY created_at",
            [b1id]);
        const [rcRows] = await db.query(
            "SELECT r.receipt_number, r.transaction_id, t.status FROM receipts r JOIN transactions t ON t.id = r.transaction_id WHERE t.booking_id = ?",
            [b1id]);
        const expectedAmount = Math.round(Number(tp.price) * 1.5 * 100) / 100;
        const done = txRows.find((t) => t.status === "completed");
        record("P1", "Failed payment, then successful retry; failed attempt preserved",
            `first attempt failed and kept; one completed attempt of K${expectedAmount.toFixed(2)} (fee 10%, payout 90%); one receipt linked to the completed attempt`,
            { firstAttempt: brief(p1), retry: brief(p2), transactionsInDatabase: txRows, receiptsInDatabase: rcRows },
            txRows.some((t) => t.id === p1.body?.transaction?.id && t.status === "failed") && txRows.filter((t) => t.status === "completed").length === 1
            && Number(done?.amount) === expectedAmount
            && Number(done?.platform_fee) === Math.round(expectedAmount * 0.1 * 100) / 100
            && Math.abs(Number(done.platform_fee) + Number(done.tutor_payout) - Number(done.amount)) < 0.001
            && rcRows.length === 1 && rcRows[0].transaction_id === done.id);

        const p3 = await call("POST", "/api/payments/initiate", ST, { booking_id: b1id, provider: "mtn", msisdn: "0977123456" });
        record("P2", "Second payment for a paid booking is rejected", "400 already paid", { response: brief(p3) },
            p3.status === 400 && /already/i.test(p3.body?.message || ""));

        const r1 = await call("GET", `/api/payments/${done?.id}`, OS);
        const r2 = await call("GET", `/api/payments/${done?.id}`, ST);
        const r3 = await call("GET", `/api/payments/${done?.id}`, TU);
        record("S4", "Receipt is visible only to the student and tutor on the booking",
            "other student 403; student 200; tutor 200",
            { otherStudent: brief(r1), student: { status: r2.status }, tutor: { status: r3.status } },
            r1.status === 403 && r2.status === 200 && r3.status === 200);

        // ---------- Database constraint on its own (bypassing the code) ----------
        let constraint;
        try {
            await db.query(
                `INSERT INTO transactions (id, booking_id, student_id, tutor_id, provider, payer_msisdn, amount, platform_fee, tutor_payout, status)
                 VALUES (?, ?, ?, ?, 'mtn', '0977123456', 1, 0.1, 0.9, 'pending')`,
                [uuidv4(), b1id, STUDENT, TUTOR]);
            constraint = "inserted (constraint missing)";
        } catch (e) { constraint = `${e.code}: ${e.sqlMessage}`; }
        record("C1", "Database refuses a second active payment even if the code is bypassed",
            "ER_DUP_ENTRY on uq_one_active_payment_per_booking", { directInsert: constraint }, /DUP_ENTRY/.test(constraint));

        // ---------- Review ----------
        const v0 = await call("POST", "/api/tutors/reviews/add", ST, { tutorId: TUTOR2, rating: 5, comment: "Great" });
        // Only refused for lack of a session if Subira has no completed session with Celine yet
        const [[hadSession]] = await db.query("SELECT COUNT(*) n FROM bookings WHERE student_id=? AND tutor_id=? AND status='completed'", [STUDENT, TUTOR2]);
        record("R1", "Review without a completed session is rejected", "403",
            { response: brief(v0), completedSessionsBeforeTest: Number(hadSession.n) }, Number(hadSession.n) > 0 || v0.status === 403);

        const c1 = await book(ST, TUTOR2, "2027-01-12", "2:00 PM", 60);
        const c1id = c1.body?.booking?.id;
        await call("PATCH", `/api/bookings/${c1id}`, T2, { status: "confirmed" });
        await call("PATCH", `/api/bookings/${c1id}`, T2, { status: "completed" });
        const [[before]] = await db.query("SELECT rating, reviews_count FROM tutor_profiles WHERE user_id = ?", [TUTOR2]);
        const v1 = await call("POST", "/api/tutors/reviews/add", ST, { tutorId: TUTOR2, rating: 3, comment: `${TAG} review` });
        const [[after]] = await db.query("SELECT rating, reviews_count FROM tutor_profiles WHERE user_id = ?", [TUTOR2]);
        const [[agg]] = await db.query("SELECT COUNT(*) n, ROUND(AVG(rating),2) a FROM reviews WHERE tutor_id = ?", [TUTOR2]);
        const v2 = await call("POST", "/api/tutors/reviews/add", ST, { tutorId: TUTOR2, rating: 1, comment: "again" });
        const v3 = await call("POST", "/api/tutors/reviews/add", ST, { tutorId: TUTOR2, rating: 9, comment: "bad rating" });
        record("R2", "Review after completed session updates the stored average",
            "201; stored rating/count equal the AVG/COUNT of the review rows",
            { response: brief(v1), profileBefore: before, profileAfter: after, recomputedFromReviews: agg },
            v1.status === 201 && Number(after.reviews_count) === Number(agg.n) && Number(after.rating) === Number(agg.a));
        record("R3", "Second review of the same tutor is rejected", "409", { response: brief(v2) }, v2.status === 409);
        record("R4", "Rating outside 1-5 is rejected", "400", { response: brief(v3) }, v3.status === 400);

        // ---------- Cancellation ----------
        const k1 = await book(ST, TUTOR, "2027-01-13", "9:00 AM", 60);
        const k1id = k1.body?.booking?.id;
        await call("PATCH", `/api/bookings/${k1id}`, TU, { status: "confirmed" });
        const kc = await call("PATCH", `/api/bookings/${k1id}`, ST, { status: "cancelled" });
        const kp = await call("POST", "/api/payments/initiate", ST, { booking_id: k1id, provider: "mtn", msisdn: "0977123456" });
        const kre = await book(ST, TUTOR, "2027-01-13", "9:00 AM", 60);
        const kch = await call("PATCH", `/api/bookings/${k1id}`, TU, { status: "confirmed" });
        record("K1", "Cancelled booking: cannot be paid or changed, and its slot is free again",
            "cancel 200; pay 400; same slot re-booked 201; changing the cancelled booking 400",
            { cancel: brief(kc), payCancelled: brief(kp), rebookSameSlot: brief(kre), changeCancelled: brief(kch) },
            kc.status === 200 && kp.status === 400 && kre.status === 201 && kch.status === 400);

        // ---------- Response times ----------
        const timings = {};
        const time = async (name, n, fn) => {
            const ms = [];
            for (let i = 0; i < n; i++) ms.push((await fn(i)).ms);
            ms.sort((a, b) => a - b);
            timings[name] = { requests: n, minMs: ms[0], medianMs: ms[Math.floor(n / 2)], p95Ms: ms[Math.ceil(n * 0.95) - 1], maxMs: ms[n - 1] };
        };
        await time("GET /api/tutors (list)", 20, () => call("GET", "/api/tutors"));
        await time("GET /api/bookings (own bookings)", 20, () => call("GET", "/api/bookings", ST));
        await time("POST /api/bookings (create)", 20, (i) => book(ST, TUTOR, `2027-02-${String(i + 1).padStart(2, "0")}`, "9:00 AM", 60));
        const [perfBookings] = await db.query("SELECT id FROM bookings WHERE subject = ? AND date LIKE '2027-02-%'", [TAG]);
        for (const b of perfBookings) await call("PATCH", `/api/bookings/${b.id}`, TU, { status: "confirmed" });
        await time("POST /api/payments/initiate (incl. 600 ms simulated gateway delay)", perfBookings.length, (i) =>
            call("POST", "/api/payments/initiate", ST, { booking_id: perfBookings[i].id, provider: "mtn", msisdn: "0977123456" }));
        await time("GET /api/tutors/reviews/:tutorId", 20, () => call("GET", `/api/tutors/reviews/${TUTOR2}`));

        const out = { api: BASE, database: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
            at: new Date().toISOString(), node: process.version, results, timings };
        const file = path.join(__dirname, "results", "evidence.json");
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(out, null, 2));
        console.log("\nResponse times (ms):");
        console.table(timings);
    } finally {
        await db.query("DELETE FROM reviews WHERE comment = ?", [`${TAG} review`]);
        const [[s]] = await db.query("SELECT COUNT(*) n, COALESCE(AVG(rating),0) a FROM reviews WHERE tutor_id = ?", [TUTOR2]);
        await db.query("UPDATE tutor_profiles SET rating = ?, reviews_count = ? WHERE user_id = ?", [Number(s.a).toFixed(2), s.n, TUTOR2]);
        const [d] = await db.query("DELETE FROM bookings WHERE subject = ?", [TAG]);
        console.log(`cleanup: deleted ${d.affectedRows} test bookings (with their payments and receipts), the test review, and restored Celine's rating`);
        await db.end();
    }
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(1); });
