const { firestoreDB } = require("../lib/firestore");
const { pusherServer } = require("../lib/pusher");

const userLogin = async (req, res) => {
  const { dispatcherName } = req.body;
  console.log("Dispatchers name: ", dispatcherName);
  const dispatchersRef = firestoreDB.collection("dispatchers");
  const snapshot = await dispatchersRef
    .where("name", "==", dispatcherName)
    .get();

  if (snapshot.empty) {
    return res.status(400).json({ message: "Please enter a valid id" });
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
  console.log("New dispathcer route hit");
  const { userName } = req.body;

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
    });

    const newDispatcherData = (await response.get()).data();
    console.log(newDispatcherData);

    pusherServer.trigger("notification", "new-dispatcher", newDispatcherData);

    return res.json({
      success: true,
      message:
        "Dispatcher successfully created. \nYou'll be redirected shortly",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Some error occured while creating a new dispatcher",
    });
  }
};

module.exports = { userLogin, registerNewUser };
