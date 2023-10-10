const { pusherServer } = require("../lib/pusher");

const pusherUserAuth = async (req, res) => {
  console.log("Pusher auth hit", req.session.user);
  const { socket_id, channel_name } = req.body;
  const randomString = Math.random().toString(36).slice(2);

  const presenceData = {
    id: randomString,
  };

  req.session.userId = randomString;

  try {
    const auth = pusherServer.authenticateUser(socket_id, presenceData);
    return res.send(auth);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  pusherUserAuth,
};
