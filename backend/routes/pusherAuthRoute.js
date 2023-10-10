const express = require("express");
const { pusherUserAuth } = require("../Controllers/pusherUserAuth");

const pusherAuthRoute = express.Router();

pusherAuthRoute.post("/pusherAuthRoute", pusherUserAuth);

module.exports = pusherAuthRoute;
