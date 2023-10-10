const Pusher = require("pusher");

const pusherServer = new Pusher({
    appId: process.env.app_id,
    key: process.env.key,
    secret: process.env.secret,
    cluster: process.env.cluster,
    useTLS: true,
  });

  module.exports = {pusherServer}