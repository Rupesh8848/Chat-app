const express = require("express");
const { userLogin } = require("../Controllers/userControllers");

const userRoute = express.Router();

userRoute.post("/auth/login", userLogin);

module.exports = userRoute;
