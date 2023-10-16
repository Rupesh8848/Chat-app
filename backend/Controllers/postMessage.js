const { firestoreDB } = require("../lib/firestore");
const { pusherServer } = require("../lib/pusher");
const { firestore } = require("firebase-admin");

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
  const { message, userName, channel, reciverName } = req.body;

  try {
    const dispatchersRef = firestoreDB.collection("dispatchers");

    //for sender
    const snapshot = await dispatchersRef.where("name", "==", userName).get();
    if (snapshot.empty) {
      console.log("Empty snapshot");
      return res.json({ message: "Some error occured" });
    }

    const userData = snapshot.docs[0].data();

    const userDocId = snapshot.docs[0].id;

    const userRef = firestoreDB.collection("dispatchers").doc(userDocId);

    if (!userData.channels.includes(channel)) {
      const updateRes = await userRef.update({
        channels: firestore.FieldValue.arrayUnion(channel),
      });
    }

    //for receiver
    const receiverSnapshot = await dispatchersRef
      .where("name", "==", reciverName)
      .get();
    if (receiverSnapshot.empty) {
      console.log("Empty snapshot");
      return res.json({ message: "Some error occured" });
    }

    const receiverData = receiverSnapshot.docs[0].data();

    const receiverDocId = receiverSnapshot.docs[0].id;

    const receiverRef = firestoreDB
      .collection("dispatchers")
      .doc(receiverDocId);

    if (!receiverData.channels.includes(channel)) {
      const updateRes = await receiverRef.update({
        channels: firestore.FieldValue.arrayUnion(channel),
      });
    }

    // add document to channel in db
    const responseFromDB = await firestoreDB
      .collection(channel)
      .add({ message, userName });

    // if document successfully added to db then emit event
    if (responseFromDB.id) {
      await pusherServer.trigger("publicChannel", "chat-update", {
        message,
        userName,
      });
      return res.json({ status: 200 });
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: "Some error occured." });
  }
};

module.exports = { postMessage, postPublicMessage };
