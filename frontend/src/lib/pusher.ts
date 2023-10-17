import Pusher from "pusher-js";

export const pusherClient = new Pusher(import.meta.env.VITE_KEY, {
  cluster: import.meta.env.VITE_CLUSTER,
  forceTLS: true,
  userAuthentication: {
    endpoint: "http://localhost:8000/pusher/user-auth",
    transport: "ajax",
    paramsProvider() {
      const userData = localStorage.getItem("userData");
      const dispatchersData = localStorage.getItem("dispatchersData");
      if (!userData || !dispatchersData) return {};
      const parsedUserData = JSON.parse(userData);

      return {
        name: parsedUserData.name,
        id: parsedUserData.id,
        dispatchersData: dispatchersData,
      };
    },
  },
  channelAuthorization: {
    endpoint: "http://localhost:8000/pusher/auth",
    transport: "ajax",
    paramsProvider() {
      const userData = localStorage.getItem("userData");
      if (!userData) return {};
      const parsedUserData = JSON.parse(userData);

      return {
        name: parsedUserData.name,
        id: parsedUserData.id,
      };
    },
  },
});
