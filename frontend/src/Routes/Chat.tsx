import React from "react";

import axios from "axios";
import { pusherClient } from "../lib/pusher";
import InputFieldWithSubmit from "../Components/InputFieldWithSubmit";
import { useLocation } from "react-router-dom";

type ChatUpdateDataType = {
  message: string;
  userName: string;
};

export default function Chat() {
  const [chats, setChats] = React.useState<Array<ChatUpdateDataType>>([]);
  const [message, setMessage] = React.useState("");

  const location = useLocation();

  const userName = location.state.userName;

  React.useEffect(() => {
    const channel = pusherClient.subscribe("presence-channel");

    channel.bind("chat-update", (data: ChatUpdateDataType) => {
      console.log("Inside chat update: ", data);
      const { message, userName } = data;
      setChats((oldChats) => [
        ...oldChats,
        {
          message,
          userName,
        },
      ]);
    });
    return () => pusherClient.unsubscribe("presence-channel");
  }, []);

  const submitMessage = async () => {
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/message`, {
      userName,
      message,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <div>
      {chats.map((chat, index) => {
        return (
          <div key={index}>
            {chat.userName}:{chat.message}
          </div>
        );
      })}
      <InputFieldWithSubmit
        submitMessage={submitMessage}
        handleChange={handleChange}
      />
    </div>
  );
}
