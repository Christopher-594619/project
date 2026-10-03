const express = require("express");
const {upload} = require("../controller/common/upload");
const {authenticate} = require("../controller/auth/authenticate");
const {createBooking} = require("../controller/bookings/createBooking")
const {getBookings} = require("../controller/bookings/getBookings");
const {updateBookingStatus} = require("../controller/bookings/updateBooking");

const bookings = express.Router();


bookings.post("/", authenticate, createBooking)
bookings.get("/", authenticate, getBookings)
bookings.patch("/:id", authenticate, updateBookingStatus)

module.exports = {bookings}
