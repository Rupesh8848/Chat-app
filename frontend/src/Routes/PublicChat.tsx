import React from "react";

import axios from "axios";
import { pusherClient } from "../lib/pusher";
import { useLocation } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";

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
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

type ChatUpdateDataType = {
  message: string;
  userName: string;
};

type Dispatcher = {
  name: string;
  id: number;
  channels: Array<string>;
};

type UserData = Dispatcher;

type MessageNotification = {
  receiverUserName: string;
  message: string;
  senderUserName: string;
  channelName: string;
};

type MessageNotificationStateType = {
  seen: boolean;
  receiverUserName?: string;
  message?: string;
  senderUserName?: string;
  channelName?: string;
};

export default function PublicChat() {
  const [chats, setChats] = React.useState<Array<ChatUpdateDataType>>([]);
  const [message, setMessage] = React.useState("");

  const [messageNotification, setMessageNotification] =
    React.useState<MessageNotificationStateType>({ seen: true });

  const [selectedReceiver, setSelectedReceiver] = React.useState<Dispatcher>();

  const [isTypingData, setIsTypingData] = React.useState<{
    message: string;
    isTyping: boolean;
    senderName: string;
  }>({ message: "", isTyping: false, senderName: "" });

  const location = useLocation();

  const {
    userData,
    dispachersData,
  }: { userData: UserData; dispachersData: Array<Dispatcher> } = location.state;
  console.log(userData);

  React.useEffect(() => {
    const publicChannel = pusherClient.subscribe("notification");

    publicChannel.bind("message-notification", (data: MessageNotification) => {
      if (data.receiverUserName === userData.name) {
        const channel = pusherClient.subscribe(data.channelName);
        channel.bind("pusher:subscription_succeeded", () => {
          console.log("Subscribed to channel: ", channel);
        });

        channel.bind("pusher:subscription_error", (error) => {
          console.log("Couldn't subscribe", error);
        });

        channel.bind("chat-update", (data: ChatUpdateDataType) => {
          console.log("Inside chat update: ", data);
          const { message, userName } = data;

          setChats((oldChats) => {
            if (messageNotification.senderUserName === selectedReceiver?.name) {
              return [
                ...oldChats,
                {
                  message,
                  userName,
                },
              ];
            } else {
              return oldChats;
            }
          });
        });
        setMessageNotification({ ...data, seen: false });
      }
    });

    userData.channels.forEach((channelToSubscribe) => {
      const channel = pusherClient.subscribe(channelToSubscribe);

      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Subscribed to channel: ", channel);
      });

      channel.bind("pusher:subscription_error", (error) => {
        console.log("Couldn't subscribe", error);
      });

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

      channel.bind(
        "is-typing",
        (data: { message: string; senderUserName: string }) => {
          // if (data.reciverName !== userData.name) return;
          setIsTypingData({
            message: data.message,
            isTyping: true,
            senderName: data.senderUserName,
          });
          setTimeout(() => {
            setIsTypingData({ message: "", isTyping: false, senderName: "" });
          }, 2000);
        }
      );
    });

    return () => {
      userData.channels.forEach((channelToUnSub) => {
        pusherClient.unsubscribe(channelToUnSub);
      });
    };
  }, []);

  React.useEffect(() => {
    async function fetchNewMesg() {
      const response = await axios.get(
        `http://localhost:8000/api/message/${userData.name}/${selectedReceiver?.name}`
      );

      setChats(response.data);
    }

    if (selectedReceiver) {
      fetchNewMesg();
    }
  }, [selectedReceiver]);

  const submitMessage = async () => {
    console.log(selectedReceiver);
    if (!selectedReceiver) return;
    await axios.post("http://localhost:8000/api/message/public", {
      userName: userData.name,
      message,
      reciverName: selectedReceiver.name,
      channel:
        userData.name > selectedReceiver?.name
          ? `presence-${selectedReceiver?.name}-${userData.name}`
          : `presence-${userData.name}-${selectedReceiver?.name}`,
    });
  };

  const isTypingHandler = async () => {
    if (!selectedReceiver) return;
    await axios.post("http://localhost:8000/api/typing-status/", {
      userName: userData.name,
      reciverName: selectedReceiver.name,
      message,
      channel:
        userData.name > selectedReceiver?.name
          ? `presence-${selectedReceiver?.name}-${userData.name}`
          : `presence-${userData.name}-${selectedReceiver?.name}`,
    });
  };

  const handleConversationClick = async (selectedDispatcher: Dispatcher) => {
    setMessageNotification((oldData) => ({ ...oldData, seen: true }));
    console.log(selectedDispatcher);
    setSelectedReceiver(selectedDispatcher);
  };

  return (
    <div className="h-[100vh] w-full flex justify-center items-center">
      <div className="h-[80%] w-[90%]">
        <MainContainer responsive>
          <Sidebar position="left" scrollable={true}>
            <ConversationList>
              {dispachersData.map((dispatcher: Dispatcher) => {
                if (dispatcher.name === userData.name) {
                  return;
                }
                return (
                  <Conversation
                    className={`${
                      dispatcher.name === selectedReceiver?.name
                        ? "bg-gray-500"
                        : ""
                    } ${
                      messageNotification.senderUserName === dispatcher.name
                        ? "bg-red-400"
                        : ""
                    }`}
                    onClick={() => handleConversationClick(dispatcher)}
                  >
                    {/* <Avatar name={dispatcher.name} status="available" /> */}
                    <Conversation.Content
                      name={dispatcher.name}
                      // lastSenderName="Lilly"
                    />
                  </Conversation>
                );
              })}
            </ConversationList>
          </Sidebar>
          <ChatContainer>
            <MessageList
              typingIndicator={
                isTypingData.isTyping &&
                userData.name !== isTypingData.senderName && (
                  <TypingIndicator
                    content={`${selectedReceiver?.name} is typing: ${isTypingData.message}`}
                  />
                )
              }
            >
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
                          chat.userName === userData.name
                            ? "outgoing"
                            : "incoming",
                        position: "normal",
                      }}
                      avatarPosition={
                        chat.userName === userData.name
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
                isTypingHandler();
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
