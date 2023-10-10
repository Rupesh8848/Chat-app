const { pusherServer } = require("../lib/pusher");

const postMessage = async (req, res) => {
  const { message, userName } = req.body;

  console.log("Message received: ", message);
  const response = await pusherServer.trigger(
    "presence-channel",
    "chat-update",
    {
      message,
      userName,
    }
  );
  console.log(response);
  return res.json({ status: 200 });
};

const postPublicMessage = async (req, res) => {
  const { message, userName } = req.body;

  console.log("Message received: ", message);
  const response = await pusherServer.trigger("publicChannel", "chat-update", {
    message,
    userName,
  });
  console.log(response);
  return res.json({ status: 200 });
};

module.exports = { postMessage, postPublicMessage };
