const express = require("express");
const {
  postMessage,
  postPublicMessage,
  getMessages,
  sendFile,
} = require("../Controllers/postMessage");

const messageRoute = express.Router();

messageRoute.post("/", postMessage);
messageRoute.post("/public", postPublicMessage);
messageRoute.get("/:senderName/:receiverName", getMessages);
messageRoute.post("/file", sendFile);

module.exports = { messageRoute };
