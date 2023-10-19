import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import Landing from "./Routes/Landing";
import Chat from "./Routes/Chat";
import PublicChat from "./Routes/PublicChat";
import SelectChannel from "./Routes/SelectChannel";
import axios from "axios";
import NewUser from "./Routes/NewUser";
import { Toaster } from "react-hot-toast";
import { pusherClient } from "./lib/pusher";

function App() {
  const [userName, setUserName] = React.useState<null | string>(null);
  const navigate = useNavigate();
  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const response = await axios.post(
      "http://localhost:8000/api/user/auth/login",
      {
        dispatcherName: userName,
      }
    );
    if (response.status === 200) {
      localStorage.setItem("userData", JSON.stringify(response.data.userData));
      const dispatchersData = response.data.dispatchersData.map(
        (dispatcher: { id: number }) => `${dispatcher.id}`
      );
      localStorage.setItem("dispatchersData", JSON.stringify(dispatchersData));
      pusherClient.signin();
      navigate("public-chat", {
        state: {
          userData: response.data.userData,
          dispachersData: response.data.dispatchersData,
        },
      });
    } else if (response.status === 400) {
      console.log(response.data.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <>
      <Routes>
        <Route
          index
          element={
            <Landing
              userName={userName}
              handleChange={handleChange}
              handleLogin={handleLogin}
            />
          }
        />
        <Route
          path="select-channel"
          element={<SelectChannel userName={userName || ""} />}
        />
        <Route path="chat" element={<Chat />} />
        <Route path="public-chat" element={<PublicChat />} />
        <Route path="new-user" element={<NewUser />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
