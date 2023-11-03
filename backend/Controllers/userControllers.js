const { firestoreDB } = require("../lib/firestore");
const { pusherServer } = require("../lib/pusher");

const userLogin = async (req, res) => {
  const { dispatcherName } = req.body;
  const dispatchersRef = firestoreDB.collection("dispatchers");
  const snapshot = await dispatchersRef
    .where("name", "==", dispatcherName)
    .get();

  if (snapshot.empty) {
    return res.json({ message: "Please enter a valid id" });
  }

  const allDispatchers = await dispatchersRef.get();

  const dispatchersData = [];

  allDispatchers.forEach((doc) => {
    dispatchersData.push(doc.data());
  });

  return res
    .status(200)
    .json({ userData: snapshot.docs[0].data(), dispatchersData });
};

const registerNewUser = async (req, res) => {
  const { userName, profilePic } = req.body;

  try {
    const dispatchersCollectionRef = firestoreDB.collection("dispatchers");

    const snapshot = await dispatchersCollectionRef.count().get();

    const dataSnapshot = await dispatchersCollectionRef
      .where("name", "==", userName)
      .get();

    if (!dataSnapshot.empty) {
      return res.json({
        success: false,
        message:
          "Dispatcher with given name already exists.\nPlease try new name.",
      });
    }

    const response = await dispatchersCollectionRef.add({
      name: userName,
      channels: [],
      id: snapshot.data().count + 1,
      profilePic,
    });

    const newDispatcherData = (await response.get()).data();

    pusherServer.trigger("notification", "new-dispatcher", newDispatcherData);

    return res.json({
      success: true,
      message:
        "Dispatcher successfully created. \nYou'll be redirected shortly",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some error occured while creating a new dispatcher",
    });
  }
};

const getAllDispatchers = async (req, res) => {
  const requestingUserId = req.params.userId;
  const dispatchersRef = firestoreDB.collection("dispatchers");
  const snapshot = await dispatchersRef.get();
  const dispatchers = [];
  snapshot.docs.forEach((dispatcher) => {
    const dispatcherData = dispatcher.data();
    if (+dispatcherData.id !== +requestingUserId) {
      dispatchers.push(dispatcher.data());
    }
  });

  return res.json(dispatchers);
};

const getUserData = async (req, res) => {
  const { userId } = req.params;
  try {
    const dispatchersCollectionRef = firestoreDB.collection("dispatchers");
    const snapshot = await dispatchersCollectionRef
      .where("id", "==", userId)
      .get();

    const userData = snapshot.docs[0].data();

    return res.status(302).json({ userData });
  } catch (error) {
    return res.status(404);
  }
};

module.exports = { userLogin, registerNewUser, getAllDispatchers, getUserData };
