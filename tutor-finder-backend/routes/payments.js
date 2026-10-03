const express = require("express");
const { authenticate } = require("../controller/auth/authenticate");
const { db } = require("../modal/db");
const {
    initiatePayment,
    retryPayment,
    getFullTransaction,
    PaymentError,
} = require("../controller/payments/paymentService");
const { SUPPORTED_PROVIDERS } = require("../controller/payments/momoGateway");

const payments = express.Router();

payments.post("/initiate", authenticate, async (req, res) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Only students can make payments." });
    }
    const { booking_id, provider, msisdn } = req.body;
    if (!booking_id || !provider || !msisdn) {
        return res.status(400).json({ success: false, message: "booking_id, provider and msisdn are required." });
    }
    if (!SUPPORTED_PROVIDERS.includes(provider)) {
        return res.status(400).json({ success: false, message: `provider must be one of: ${SUPPORTED_PROVIDERS.join(", ")}` });
    }

    try {
        const transaction = await initiatePayment({
            bookingId: booking_id,
            studentId: req.user.userId,
            provider,
            msisdn,
        });
        return res.status(transaction.status === "completed" ? 201 : 402).json({
            success: transaction.status === "completed",
            transaction,
        });
    } catch (err) {
        if (err instanceof PaymentError) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error("Error initiating payment:", err);
        return res.status(500).json({ success: false, message: "Could not process payment." });
    }
});

payments.post("/:id/retry", authenticate, async (req, res) => {
    const { provider, msisdn } = req.body;
    try {
        const transaction = await retryPayment({
            transactionId: req.params.id,
            studentId: req.user.userId,
            provider,
            msisdn,
        });
        return res.status(transaction.status === "completed" ? 201 : 402).json({
            success: transaction.status === "completed",
            transaction,
        });
    } catch (err) {
        if (err instanceof PaymentError) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error("Error retrying payment:", err);
        return res.status(500).json({ success: false, message: "Could not retry payment." });
    }
});

// Fetch a transaction + its receipt for viewing, printing or downloading
// later — not just right after paying. Only the student who paid or the
// tutor who was paid can view it.
payments.get("/:id", authenticate, async (req, res) => {
    try {
        const transaction = await getFullTransaction(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found." });
        }
        if (transaction.student_id !== req.user.userId && transaction.tutor_id !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Not authorized to view this transaction." });
        }
        return res.json({ success: true, transaction });
    } catch (err) {
        console.error("Error fetching transaction:", err);
        return res.status(500).json({ success: false, message: "Could not fetch transaction." });
    }
});

module.exports = { payments };
