const express = require("express");
const { authenticate } = require("../controller/auth/authenticate");
const { isAdmin } = require("../middleware/isAdmin");

const { getStats } = require("../controller/admin/getStats");
const { getUsers } = require("../controller/admin/getUsers");
const { getTutors } = require("../controller/admin/getTutors");
const { updateUserStatus } = require("../controller/admin/updateUserStatus");
const { updateTutorVerification } = require("../controller/admin/updateTutorVerification");
const { updateTutorListing } = require("../controller/admin/updateTutorListing");
const { deleteUser } = require("../controller/admin/deleteUser");
const { getBookings } = require("../controller/admin/getBookings");
const { updateBookingStatus } = require("../controller/bookings/updateBookingStatus");

const admin = express.Router();

// Every admin route requires a valid session AND the admin role.
admin.use(authenticate, isAdmin);

admin.get("/stats", getStats);

admin.get("/users", getUsers);
admin.patch("/users/:id/status", updateUserStatus);
admin.delete("/users/:id", deleteUser);

admin.get("/tutors", getTutors);
admin.patch("/tutors/:id/verify", updateTutorVerification);
admin.patch("/tutors/:id/listing", updateTutorListing);

admin.get("/bookings", getBookings);
admin.patch("/bookings/:id/status", updateBookingStatus);

module.exports = { admin };
