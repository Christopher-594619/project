const express = require("express");
const {getCurrentUser} = require("../controller/users/me");
const {updateUserProfile, updateUserPassword} = require("../controller/users/updateUser");
const {upload} = require("../controller/common/upload")

const {authenticate} = require("../controller/auth/authenticate");

const users = express.Router();

users.get("/me", authenticate, getCurrentUser);
users.patch("/profile", authenticate, upload.single("photo"), updateUserProfile);
users.patch("/password", authenticate, updateUserPassword);

module.exports = {users}