const express = require("express");
const { pusherServer } = require("../lib/pusher");

const isTypingRoute = express.Router();

isTypingRoute.post("/", async (req, res) => {
  const { userName, message, reciverName, channel } = req.body;
  pusherServer.trigger(channel, "is-typing", {
    senderUserName: userName,
    message,
    reciverName,
  });
});

module.exports = { isTypingRoute };
