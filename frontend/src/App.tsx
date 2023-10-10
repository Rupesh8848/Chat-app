import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import Landing from "./Routes/Landing";
import Chat from "./Routes/Chat";
import PublicChat from "./Routes/PublicChat";
import SelectChannel from "./Routes/SelectChannel";
import axios from "axios";

function App() {
  const [userName, setUserName] = React.useState<null | string>(null);
  const navigate = useNavigate();
  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const response = await axios.post("http://localhost:8000/login", {
      userName,
    });
    console.log(response.data);
    if (userName) {
      navigate("/select-channel");
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
      </Routes>
    </>
  );
}

export default App;
