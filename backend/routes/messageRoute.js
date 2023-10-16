const express = require("express");
const {
  postMessage,
  postPublicMessage,
  getMessages,
} = require("../Controllers/postMessage");

const messageRoute = express.Router();

messageRoute.post("/", postMessage);
messageRoute.post("/public", postPublicMessage);
messageRoute.get("/:senderName/:receiverName", getMessages);

module.exports = { messageRoute };
