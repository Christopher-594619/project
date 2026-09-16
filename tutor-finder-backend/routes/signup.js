const express = require("express");
const {signup} = require("../controller/auth/signup");
const {login} = require("../controller/auth/login");
const {refreshToken} = require("../controller/auth/token.refresh");
const {verifyCode} = require("../controller/auth/sendEmail");
const {sendEmail} = require("../controller/auth/sendEmail");
const {logout} = require("../controller/auth/logout");

const auth = express.Router();

auth.post("/signup", signup);
auth.post("/login", login);
auth.post("/refresh", refreshToken);
auth.post("/verify-code", verifyCode);
auth.post("/send-verification-email", sendEmail)
auth.post("/logout", logout);

module.exports = {auth}