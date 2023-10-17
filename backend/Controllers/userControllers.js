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
  const { userName } = req.body;

  try {
    const dispatchersCollectionRef = firestoreDB.collection("dispatchers");

    const snapshot = await dispatchersCollectionRef.count().get();

    const res = await dispatchersCollectionRef.add({
      name: userName,
      channels: [],
      id: snapshot.data().count + 1,
    });

    console.log(res.get());

    pusherServer.trigger("notification", "new-dispatcher", {});

    return res.status(201).json({
      success: true,
      message:
        "Dispatcher successfully created. \nYou'll be redirected shortly",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Some error occured while creating a new dispatcher",
    });
  }
};

module.exports = { userLogin, registerNewUser };
