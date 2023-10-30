const { firestoreDB } = require("../lib/firestore");
const { pusherServer } = require("../lib/pusher");
const { firestore } = require("firebase-admin");

const postMessage = async (req, res) => {
  const { message, userName, channelName } = req.body;

  console.log("Message received: ", message);
  try {
    firestoreDB
      .collection(channelName)
      .add({
        message,
        userName,
        created: firestore.FieldValue.serverTimestamp(),
      })
      .then(async () => {
        pusherServer
          .trigger(channelName, "chat-update", {
            message,
            userName,
          })
          .then(() => {
            return res.json({ status: 200 });
          });
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Some error occured in server" });
  }
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

    const userData = snapshot.docs[0].data(); //sender obj

    const userDocId = snapshot.docs[0].id;

    const userRef = firestoreDB.collection("dispatchers").doc(userDocId);

    //for receiver
    const receiverSnapshot = await dispatchersRef
      .where("name", "==", reciverName)
      .get();
    if (receiverSnapshot.empty) {
      console.log("Empty snapshot");
      return res.json({ message: "Some error occured" });
    }

    const receiverData = receiverSnapshot.docs[0].data(); //receiver obj

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
    const responseFromDB = await firestoreDB.collection(channel).add({
      message,
      userName,
      created: firestore.FieldValue.serverTimestamp(),
    });

    if (!userData.channels.includes(channel)) {
      const updateRes = await userRef.update({
        channels: firestore.FieldValue.arrayUnion(channel),
      });

      const updatedUserRef = await firestoreDB
        .collection("dispatchers")
        .doc(userDocId)
        .get();

      const updatedReceiverRef = await firestoreDB
        .collection("dispatchers")
        .doc(receiverDocId)
        .get();

      pusherServer.trigger("notification", "message-notification", {
        receiverUserName: reciverName,
        message: message,
        senderUserName: userName,
        channelName: channel,
        senderData: updatedUserRef.data(),
        receiverData: updatedReceiverRef.data(),
      });
    }
    // if document successfully added to db then emit event
    if (responseFromDB.id) {
      await pusherServer.trigger(channel, "chat-update", {
        message,
        userName,
      });
      return res.status(200);
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: "Some error occured." });
  }
};

const getMessages = async (req, res) => {
  console.log("Fetch mesg hit");
  const { senderName, receiverName } = req.params;

  const channelName =
    senderName > receiverName
      ? `presence-${receiverName}-${senderName}`
      : `presence-${senderName}-${receiverName}`;

  console.log(channelName);

  const messagesRef = firestoreDB
    .collection(channelName)
    .orderBy("created", "asc");

  const snapshot = await messagesRef.get();

  const messages = [];

  snapshot.forEach((mesg) => {
    messages.push(mesg.data());
  });
  console.log(messages);

  return res.send(messages);
};

const sendFile = async (req, res) => {
  const { userName, fileURL, reciverName, channel, fileName } = req.body;
  try {
    const responseFromDB = await firestoreDB.collection(channel).add({
      message: fileName,
      userName,
      created: firestore.FieldValue.serverTimestamp(),
      type: "file",
      fileURL,
    });
    pusherServer.trigger(channel, "file-message", {
      message: fileName,
      userName,
      type: "file",
      fileURL,
    });
    return res.status(200);
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
};

module.exports = { postMessage, postPublicMessage, getMessages, sendFile };
