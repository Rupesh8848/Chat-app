const express = require("express");
const { pusherServer } = require("../lib/pusher");

const isTypingRoute = express.Router();

isTypingRoute.post("/", async (req, res) => {
  const { userName, reciverName, channel, message } = req.body;
  console.log(userName, reciverName, channel, message);
  pusherServer.trigger(channel, "is-typing", {
    senderUserName: userName,
    reciverName,
    message,
  });
  return res.send("done");
});

module.exports = { isTypingRoute };
