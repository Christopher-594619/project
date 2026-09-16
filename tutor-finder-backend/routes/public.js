const express = require("express");
const {serveIndex} = require("../controller/public");

const public = express.Router();

// Serve index.html at root path
public.get("/", serveIndex);

module.exports = {public};