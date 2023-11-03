const { firestoreDB } = require("../lib/firestore");
const { pusherServer } = require("../lib/pusher");

const pusherUserAuth = async (req, res) => {
  const { socket_id, channel_name } = req.body;
  const randomString = Math.random().toString(36).slice(2);

  // const collectionRef = firestoreDB.collection("disptachers");

  // const snapshot = collectionRef.where("name","==",)

  const presenceData = {
    id: randomString,
  };

  req.session.userId = randomString;

  try {
    const auth = pusherServer.authenticateUser(socket_id, presenceData);
    return res.send(auth);
  } catch (error) {}
};

module.exports = {
  pusherUserAuth,
};
