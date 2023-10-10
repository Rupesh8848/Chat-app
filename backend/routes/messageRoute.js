const express = require("express");
const {
  postMessage,
  postPublicMessage,
} = require("../Controllers/postMessage");

const messageRoute = express.Router();

messageRoute.post("/", postMessage);
messageRoute.post("/public", postPublicMessage);

module.exports = { messageRoute };
