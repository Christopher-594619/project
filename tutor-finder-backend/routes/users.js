const express = require("express");
const {getCurrentUser} = require("../controller/users/me");
const {updateUser} = require("../controller/users/updateUser");

const {authenticate} = require("../controller/auth/authenticate");

const users = express.Router();

users.get("/me", authenticate, getCurrentUser);
users.post("/update", authenticate, updateUser);

module.exports = {users}