import React from "react";

import axios from "axios";
import { pusherClient } from "../lib/pusher";
import { useLocation } from "react-router-dom";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  Sidebar,
  ConversationList,
  Conversation,
} from "@chatscope/chat-ui-kit-react";

type ChatUpdateDataType = {
  message: string;
  userName: string;
};

export default function PublicChat() {
  const [chats, setChats] = React.useState<Array<ChatUpdateDataType>>([]);
  const [message, setMessage] = React.useState("");

  const location = useLocation();

  const { userName, dispachersData } = location.state;

  React.useEffect(() => {
    const channel = pusherClient.subscribe("publicChannel");

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

    return () => pusherClient.unsubscribe("publicChannel");
  }, []);

  const submitMessage = async () => {
    await axios.post("http://localhost:8000/api/message/public", {
      userName,
      message,
    });
  };

  const handleConversationClick = async ({ id }: { id: number }) => {};

  return (
    <div className="h-[100vh] w-full flex justify-center items-center">
      <div className="h-[80%] w-[90%]">
        <MainContainer responsive>
          <Sidebar position="left" scrollable={true}>
            <ConversationList>
              {dispachersData.map(
                (dispatcher: { name: string; id: number }) => {
                  if (dispatcher.name === userName) {
                    return;
                  }
                  return (
                    <Conversation
                      onClick={() =>
                        handleConversationClick({ id: dispatcher.id })
                      }
                    >
                      {/* <Avatar name={dispatcher.name} status="available" /> */}
                      <Conversation.Content
                        name={dispatcher.name}
                        // lastSenderName="Lilly"
                        info="Yes i can do it for you"
                      />
                    </Conversation>
                  );
                }
              )}
            </ConversationList>
          </Sidebar>
          <ChatContainer>
            <MessageList>
              {chats.map((chat) => {
                return (
                  <>
                    <Message
                      autoFocus
                      model={{
                        message: chat.message,
                        sender: chat.userName,
                        sentTime: "Just Now",
                        direction:
                          chat.userName === userName ? "outgoing" : "incoming",
                        position: "normal",
                      }}
                      avatarPosition={
                        chat.userName === userName
                          ? "center-right"
                          : "center-left"
                      }
                    >
                      <Avatar
                        name={chat.userName}
                        src="https://media.npr.org/assets/img/2017/09/12/macaca_nigra_self-portrait-3e0070aa19a7fe36e802253048411a38f14a79f8.jpg"
                      />
                    </Message>
                  </>
                );
              })}
            </MessageList>
            <MessageInput
              placeholder="Type message here"
              onChange={(text) => {
                setMessage(text);
              }}
              value={message}
              onSend={() => {
                if (message.length > 0) {
                  submitMessage();
                  setMessage("");
                }
              }}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
