// routes/chat/chatRoutes.js
const express = require("express");
const {createOrGetChat} = require("../controller/chats/createChat");
const {authenticate} = require("../controller/auth/authenticate")
const {sendMessage, getMessages} = require("../controller/chats/message")
const {getUserChats} = require("../controller/chats/getUserChats");

const chats = express.Router();

chats.post("/", authenticate, createOrGetChat);
chats.get("/", authenticate, getUserChats);
chats.post("/sendMessage", authenticate, sendMessage);
chats.get("/:chatId", authenticate, getMessages);


module.exports = { chats };