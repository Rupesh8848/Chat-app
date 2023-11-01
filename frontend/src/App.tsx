import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import Landing from "./Routes/Landing";
import Chat from "./Routes/Chat";
import PublicChat from "./Routes/PublicChat";
import SelectChannel from "./Routes/SelectChannel";
import axios from "axios";
import NewUser from "./Routes/NewUser";
import toast, { Toaster } from "react-hot-toast";
import { pusherClient } from "./lib/pusher";

function App() {
  const [userName, setUserName] = React.useState<null | string>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setLoading(true);
    e.preventDefault();
    const response = await axios.post(
      "http://localhost:8000/api/user/auth/login",
      {
        dispatcherName: userName,
      }
    );
    if (response.data.userData) {
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
    } else if (response.data.message) {
      toast.error(response.data.message);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const resetUserName = () => {
    setUserName(null);
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
              loading={loading}
              resetUserName={resetUserName}
            />
          }
        />
        <Route
          path="select-channel"
          element={<SelectChannel userName={userName || ""} />}
        />
        <Route path="chat" element={<Chat />} />
        <Route path="public-chat" element={<PublicChat />}>
          <Route path=":channel" element={<PublicChat />} />
        </Route>
        <Route path="new-user" element={<NewUser />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
