const express = require("express");
const { authenticate } = require("../controller/auth/authenticate");
const {
    getNotifications,
    markNotificationRead,
} = require("../controller/users/notifications");

const notifications = express.Router();

notifications.get("/", authenticate, getNotifications);
notifications.patch("/:id/read", authenticate, markNotificationRead);

module.exports = { notifications };