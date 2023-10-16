const { firestoreDB } = require("../lib/firestore");

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

module.exports = { userLogin };
