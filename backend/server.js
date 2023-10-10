const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("./lib/firestore");
require("dotenv").config();

const pusherAuthRoute = require("./routes/pusherAuthRoute");
const { messageRoute } = require("./routes/messageRoute");
const { pusherServer } = require("./lib/pusher");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: "somesuperdupersecret",
    resave: true,
    saveUninitialized: true,
  })
);

// routes
app.use("/api/auth", pusherAuthRoute);
app.use("/api/message", messageRoute);

app.post("/login", (req, res) => {
  console.log("Session creator api hit", req.body.userName);

  req.session.user = { userName: req.body.userName };
  req.session.save();
  console.log(req.session);
  return res.send(req.session);
});

app.post("/pusher/auth", (request, response) => {
  const socketId = request.body.socket_id;
  const channel = request.body.channel_name;
  const presenceData = {
    user_id: `${socketId}`,
  };
  const auth = pusherServer.authorizeChannel(socketId, channel, presenceData);
  console.log(auth);
  response.send(auth);
});

app.listen(8000, () => {
  console.log(`Server started and listening at port 8000`);
});
