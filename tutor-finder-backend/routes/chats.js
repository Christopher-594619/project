// routes/chat/chatRoutes.js
const express = require("express");
const {createOrGetChat} = require("../controller/chats/createChat");
const {authenticate} = require("../controller/auth/authenticate")
const {sendMessage, getMessages} = require("../controller/chats/message")
const {getUserChats} = require("../controller/chats/getUserChats");
const {getUnreadCount} = require("../controller/chats/unreadCount");

const chats = express.Router();

chats.post("/", authenticate, createOrGetChat);
chats.get("/", authenticate, getUserChats);
// must come before "/:chatId" so "unread-count" isn't treated as a chat id
chats.get("/unread-count", authenticate, getUnreadCount);
chats.post("/sendMessage", authenticate, sendMessage);
chats.get("/:chatId", authenticate, getMessages);


module.exports = { chats };