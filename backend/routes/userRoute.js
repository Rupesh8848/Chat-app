const express = require("express");
const {
  userLogin,
  registerNewUser,
} = require("../Controllers/userControllers");

const userRoute = express.Router();

userRoute.post("/auth/login", userLogin);
userRoute.post("/new-user", registerNewUser);

module.exports = userRoute;
