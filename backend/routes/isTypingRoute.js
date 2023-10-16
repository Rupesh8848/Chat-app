const express = require("express");
const { pusherServer } = require("../lib/pusher");

const isTypingRoute = express.Router();

isTypingRoute.post("/", async (req, res) => {
  const { userName, reciverName, channel } = req.body;
  pusherServer.trigger(channel, "is-typing", {
    senderUserName: userName,
    reciverName,
  });
  return res.send("done");
});

module.exports = { isTypingRoute };
