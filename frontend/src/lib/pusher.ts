import Pusher from "pusher-js";

export const pusherClient = new Pusher(import.meta.env.VITE_KEY, {
  cluster: import.meta.env.VITE_CLUSTER,
  forceTLS: true,
  userAuthentication: {
    endpoint: "http://localhost:8000/api/auth/pusherAuthRoute",
    transport: "ajax",
  },
  channelAuthorization: {
    endpoint: "http://localhost:8000/pusher/auth",
    transport: "ajax",
    paramsProvider() {
      const userData = localStorage.getItem("userData");
      if (!userData) return {};
      console.log(JSON.parse(userData));
      return JSON.parse(userData);
    },
  },
});
