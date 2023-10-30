const express = require("express");
const {
  userLogin,
  registerNewUser,
  getAllDispatchers,
  getUserData,
} = require("../Controllers/userControllers");

const userRoute = express.Router();

userRoute.post("/auth/login", userLogin);
userRoute.post("/new-user", registerNewUser);
userRoute.get("/dispatchers/:userId", getAllDispatchers);
userRoute.get("/user-data/:userId", getUserData);

module.exports = userRoute;
