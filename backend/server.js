const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("./lib/firestore");
require("dotenv").config();

const pusherAuthRoute = require("./routes/pusherAuthRoute");
const { messageRoute } = require("./routes/messageRoute");
const { pusherServer } = require("./lib/pusher");
const userRoute = require("./routes/userRoute");
const { isTypingRoute } = require("./routes/isTypingRoute");

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
app.use("/api/user", userRoute);
app.use("/api/typing-status", isTypingRoute);

app.post("/pusher/user-auth", (request, response) => {
  try {
    const socketId = request.body.socket_id;
    const id = request.body.id;
    const dispatchersData = JSON.parse(request.body.dispatchersData);

    const presenceData = {
      id,
      watchlist: dispatchersData,
    };
    const auth = pusherServer.authenticateUser(socketId, presenceData);

    return response.send(auth);
  } catch (error) {
    return response
      .status(400)
      .send("There was some error authenticating user.");
  }
});

app.post("/pusher/auth", async (request, response) => {
  try {
    const socketId = request.body.socket_id;
    const channel = request.body.channel_name;
    const id = request.body.id;

    const presenceData = {
      user_id: `${id}`,
    };
    const auth = pusherServer.authorizeChannel(socketId, channel, presenceData);

    return response.send(auth);
  } catch (error) {
    return response
      .status(400)
      .send("There was some error authenticating user.");
  }
});

app.listen(8000, () => {
  console.log(`Server started and listening at port 8000`);
});
