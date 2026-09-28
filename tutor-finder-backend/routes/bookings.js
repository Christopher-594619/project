const express = require("express");
const { authenticate } = require("../controller/auth/authenticate");
const { createBooking } = require("../controller/bookings/createBooking");
const { getMyBookings } = require("../controller/bookings/getMyBookings");
const { updateBookingStatus } = require("../controller/bookings/updateBookingStatus");
const { getEarnings } = require("../controller/bookings/getEarnings");

const bookings = express.Router();

bookings.use(authenticate);

bookings.post("/", createBooking);
bookings.get("/", getMyBookings);
bookings.get("/earnings", getEarnings);
bookings.patch("/:id/status", updateBookingStatus);

module.exports = { bookings };
