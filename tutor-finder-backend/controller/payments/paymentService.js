// controller/payments/paymentService.js
const { v4: uuidv4 } = require("uuid");
const { db } = require("../../modal/db");
const { chargeMobileMoney } = require("./momoGateway");

const PLATFORM_FEE_RATE = 0.1; // 10% platform fee, rest goes to the tutor

class PaymentError extends Error {}

// What a booking costs: bookings.price is the tutor's hourly rate at the
// time of booking and bookings.duration is in minutes.
function bookingTotal(booking) {
    const hours = (Number(booking.duration) || 60) / 60;
    return Math.round(Number(booking.price) * hours * 100) / 100;
}

function splitAmount(amount) {
    const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
    const tutorPayout = Math.round((amount - platformFee) * 100) / 100;
    return { platformFee, tutorPayout };
}

async function issueReceipt(transactionId) {
    const id = uuidv4();
    const receiptNumber = `RCPT-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        Math.random() * 1000
    )}`;
    await db.promise().query(
        `INSERT INTO receipts (id, transaction_id, receipt_number) VALUES (?, ?, ?)`,
        [id, transactionId, receiptNumber]
    );
    return { id, receiptNumber };
}

async function initiatePayment({ bookingId, studentId, provider, msisdn }) {
    const [bookingRows] = await db.promise().query("SELECT * FROM bookings WHERE id = ?", [bookingId]);
    if (!bookingRows.length) {
        throw new PaymentError("Booking not found.");
    }
    const booking = bookingRows[0];

    if (booking.student_id !== studentId) {
        throw new PaymentError("This booking doesn't belong to you.");
    }
    // A tutor may mark a session completed before the student has paid,
    // so completed bookings stay payable too.
    if (booking.status !== "confirmed" && booking.status !== "completed") {
        throw new PaymentError("You can only pay once the tutor has confirmed this booking.");
    }

    const [existing] = await db.promise().query(
        "SELECT id FROM transactions WHERE booking_id = ? AND status = 'completed'",
        [bookingId]
    );
    if (existing.length) {
        throw new PaymentError("This booking has already been paid for.");
    }

    const amount = bookingTotal(booking);
    if (!(amount > 0)) {
        throw new PaymentError("This booking has no price set, so it can't be paid for.");
    }
    const { platformFee, tutorPayout } = splitAmount(amount);
    const transactionId = uuidv4();

    await db.promise().query(
        `INSERT INTO transactions
            (id, booking_id, student_id, tutor_id, provider, payer_msisdn, amount, platform_fee, tutor_payout, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [transactionId, bookingId, studentId, booking.tutor_id, provider, msisdn, amount, platformFee, tutorPayout]
    );

    const result = await chargeMobileMoney({ provider, msisdn, amount });

    if (result.success) {
        await db.promise().query(
            `UPDATE transactions SET status = 'completed', momo_reference = ?, completed_at = NOW() WHERE id = ?`,
            [result.reference, transactionId]
        );
        await issueReceipt(transactionId);
    } else {
        await db.promise().query(
            `UPDATE transactions SET status = 'failed', failure_reason = ? WHERE id = ?`,
            [result.reason, transactionId]
        );
    }

    return getFullTransaction(transactionId);
}

async function retryPayment({ transactionId, studentId, provider, msisdn }) {
    const [rows] = await db.promise().query("SELECT * FROM transactions WHERE id = ?", [transactionId]);
    if (!rows.length) {
        throw new PaymentError("Transaction not found.");
    }
    const original = rows[0];
    if (original.student_id !== studentId) {
        throw new PaymentError("This transaction doesn't belong to you.");
    }
    if (original.status !== "failed") {
        throw new PaymentError("Only a failed transaction can be retried.");
    }

    // A retry is a brand-new attempt against the same booking, so it gets
    // its own transaction row — the failed one stays in history as-is.
    return initiatePayment({
        bookingId: original.booking_id,
        studentId,
        provider: provider || original.provider,
        msisdn: msisdn || original.payer_msisdn,
    });
}

async function getFullTransaction(transactionId) {
    const [rows] = await db.promise().query(
        `SELECT t.*, r.receipt_number, r.issued_at,
                s.email AS student_email, tu.email AS tutor_email,
                CONCAT_WS(' ', s.firstName, s.lastName) AS student_name,
                CONCAT_WS(' ', tu.firstName, tu.lastName) AS tutor_name,
                b.subject, b.date, b.time, b.duration, b.price
         FROM transactions t
         JOIN users s ON s.id = t.student_id
         JOIN users tu ON tu.id = t.tutor_id
         JOIN bookings b ON b.id = t.booking_id
         LEFT JOIN receipts r ON r.transaction_id = t.id
         WHERE t.id = ?`,
        [transactionId]
    );
    const row = rows[0];
    if (!row) return row;

    // The frontend's receipt view expects the receipt fields nested under
    // `receipt`, separate from the transaction fields themselves.
    const { receipt_number, issued_at, ...transaction } = row;
    return {
        ...transaction,
        receipt: receipt_number ? { receipt_number, issued_at } : null,
    };
}

module.exports = { initiatePayment, retryPayment, getFullTransaction, bookingTotal, PaymentError };
