import React from "react";

import axios from "axios";
import { pusherClient } from "../lib/pusher";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "firebase/storage";

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
  ConversationHeader,
  StarButton,
  VoiceCallButton,
  VideoCallButton,
  InfoButton,
  TypingIndicator,
  ExpansionPanel,
} from "@chatscope/chat-ui-kit-react";
import { storage } from "../firebase";
import FileNameCard from "../Components/FileNameCard";
import { useNavigate } from "react-router-dom";

type ChatUpdateDataType = {
  message: string;
  userName: string;
  type?: string;
  fileURL?: string;
  reciverName?: string;
};

type Dispatcher = {
  name: string;
  id: number;
  channels: Array<string>;
  profilePic: string;
};

type UserData = Dispatcher;

type MessageNotification = {
  receiverUserName: string;
  message: string;
  senderUserName: string;
  channelName: string;
  receiverData: UserData;
  senderData: UserData;
};

type MessageNotificationStateType = {
  seen: boolean;
  receiverUserName?: string;
  message?: string;
  senderUserName?: string;
  channelName?: string;
};

export type FileUploadProgressTrackerType = {
  [key: string]: {
    progress: number;
    snapshot: UploadTaskSnapshot;
  };
};

export default function PublicChat() {
  const [chats, setChats] = React.useState<Array<ChatUpdateDataType>>([]);
  const [message, setMessage] = React.useState("");
  const [userData, setUserData] = React.useState<UserData>(
    JSON.parse(localStorage.getItem("userData") || "")
  );
  const [dispachersData, setDispatcherData] = React.useState<Array<Dispatcher>>(
    []
  );
  const [onlineDispatchers, setOnlineDispatchers] = React.useState<
    Array<string>
  >([]);

  const [messageNotification, setMessageNotification] =
    React.useState<MessageNotificationStateType>({ seen: true });

  const [selectedReceiver, setSelectedReceiver] = React.useState<Dispatcher>();

  const [isTypingData, setIsTypingData] = React.useState<{
    message: string;
    isTyping: boolean;
    senderName: string;
  }>({ message: "", isTyping: false, senderName: "" });

  const navigate = useNavigate();

  //Image Types
  const fileImgTypes = ["JPG", "PNG", "GIF", "JPEG"];
  // @ts-expect-error-event-type-unknown
  const watchlistEventHandler = (event) => {
    if (event.name === "online") {
      setOnlineDispatchers((oldIds) => [...oldIds, ...event.user_ids]);
    }
    if (event.name === "offline") {
      setOnlineDispatchers((oldData) =>
        oldData.filter((dispatcherId) => !event.user_ids.includes(dispatcherId))
      );
    }
  };

  React.useEffect(() => {
    pusherClient.signin();
    pusherClient.user.watchlist.bind("online", watchlistEventHandler);
    pusherClient.user.watchlist.bind("offline", watchlistEventHandler);

    // get user data on each refresh
    async function getUserData() {
      if (!localStorage.getItem("userData")) return;
      const userId = JSON.parse(localStorage.getItem("userData") || "").id;
      const res = await axios.get(
        `http://localhost:8000/api/user/user-data/${userId}`
      );
    }
    getUserData();
  }, []);

  React.useLayoutEffect(() => {
    async function getDispatchersList() {
      const dispatchersData = await axios.get(
        `http://localhost:8000/api/user/dispatchers/${userData.id}`
      );

      setDispatcherData(dispatchersData.data);
    }
    getDispatchersList();
  }, []);

  React.useEffect(() => {
    //new channel creation handler
    const publicChannel = pusherClient.subscribe("notification");

    publicChannel.bind("new-dispatcher", (data: Dispatcher) => {
      console.log("New dispatcher ", data);
      setDispatcherData((oldDispatcherData: Array<Dispatcher>) => [
        ...oldDispatcherData,
        data,
      ]);
    });

    publicChannel.bind("message-notification", (data: MessageNotification) => {
      console.log("Message to new channel: ", data);
      if (data.senderUserName === userData.name) {
        setChats((oldChat) => [
          ...oldChat,
          { message: data.message, userName: data.senderUserName },
        ]);
      }
      setUserData(() => {
        if (data.senderUserName === userData.name) {
          return data.senderData;
        } else {
          return data.receiverData;
        }
      });
      if (data.receiverUserName === userData.name) {
        setMessageNotification({ ...data, seen: false });
      }
    });

    return () => {
      publicChannel.unbind_all();
      publicChannel.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

  React.useEffect(() => {
    userData.channels.forEach((channelToSubscribe) => {
      if (!pusherClient?.channel(channelToSubscribe)?.subscribed) {
        const channel = pusherClient.subscribe(channelToSubscribe);

        channel.bind("chat-update", (data: ChatUpdateDataType) => {
          const { message, userName } = data;

          if (userName === userData.name) {
            setChats((oldChats) => [
              ...oldChats,
              {
                message,
                userName,
              },
            ]);
          }

          if (selectedReceiver?.name === userName) {
            setChats((oldChats) => [
              ...oldChats,
              {
                message,
                userName,
              },
            ]);
          }

          if (selectedReceiver?.name !== userName) {
            setMessageNotification({
              seen: false,
              senderUserName: userName,
              message: data.message,
              receiverUserName: data.reciverName,
            });
          }
        });

        // channel.bind(
        //   "is-typing",
        //   (data: { message: string; senderUserName: string }) => {
        //     setIsTypingData({
        //       message: data.message,
        //       isTyping: true,
        //       senderName: data.senderUserName,
        //     });
        //     setTimeout(() => {
        //       setIsTypingData({ message: "", isTyping: false, senderName: "" });
        //     }, 2000);
        //   }
        // );

        // for files
        // channel.bind("file-message", (data: ChatUpdateDataType) => {
        //   //here message contains the filename that was shared
        //   const { message, userName, fileURL, type, reciverName } = data;

        //   if (userName === userData.name) {
        //     setChats((oldChats) => [
        //       ...oldChats,
        //       { message, userName, fileURL, type },
        //     ]);
        //   }

        //   if (selectedReceiver?.name === userName) {
        //     setChats((oldChats) => [
        //       ...oldChats,
        //       { message, userName, fileURL, type },
        //     ]);
        //   }

        //   if (selectedReceiver?.name !== userName) {
        //     setMessageNotification({
        //       seen: false,
        //       senderUserName: userName,
        //       message,
        //       receiverUserName: reciverName,
        //     });
        //   }
        // });

        channel.bind("pusher:subscription_error", (error) => {
          console.log(error);
        });

        channel.bind("pusher:subscription_succeeded", () => {
          console.log("Subbed to channel: ", channel.name);
        });
      }
    });

    return () => {
      // userData.channels.forEach((channel) => {
      //   if (pusherClient.channel(channel).subscribed) {
      //     // pusherClient.channel(channel).unbind();
      //     pusherClient.unsubscribe(channel);
      //   }
      // });
      console.log("THis runs");
      pusherClient.allChannels().forEach((channel) => {
        if (channel.name !== "notification") {
          channel.unbind_all();
          channel.unsubscribe();
          console.log("Unsubbing from channel: ", channel.name);
        }
      });
    };
  }, [userData]);

  React.useEffect(() => {
    if (pusherClient.channels) {
      pusherClient.channels.all().forEach((channel) => {
        if (channel.name !== "notification") {
          channel.unbind_all();
          channel.bind("chat-update", (data: ChatUpdateDataType) => {
            const { message, userName } = data;

            if (userName === userData.name) {
              setChats((oldChats) => [
                ...oldChats,
                {
                  message,
                  userName,
                },
              ]);
            }

            if (selectedReceiver?.name === userName) {
              setChats((oldChats) => [
                ...oldChats,
                {
                  message,
                  userName,
                },
              ]);
            }

            if (selectedReceiver?.name !== userName) {
              setMessageNotification({
                seen: false,
                senderUserName: userName,
                message: data.message,
                receiverUserName: data.reciverName,
              });
            }
          });
        }
      });
    }
  }, [selectedReceiver]);

  const submitMessage = async () => {
    if (!selectedReceiver) return;

    const channelName =
      userData.name > selectedReceiver?.name
        ? `presence-${selectedReceiver?.name}-${userData.name}`
        : `presence-${userData.name}-${selectedReceiver?.name}`;

    if (userData.channels.includes(channelName)) {
      await axios.post("http://localhost:8000/api/message/", {
        message,
        userName: userData.name,
        channelName,
        reciverName: selectedReceiver.name,
      });
    } else {
      // its labelled as public route but the message will be sent to their respective channel rather than public channel
      await axios.post("http://localhost:8000/api/message/public", {
        userName: userData.name,
        message,
        reciverName: selectedReceiver.name,
        channel: channelName,
      });
    }
  };

  const isTypingHandler = async () => {
    if (!selectedReceiver) return;
    // await axios.post("http://localhost:8000/api/typing-status/", {
    //   userName: userData.name,
    //   reciverName: selectedReceiver.name,
    //   message,
    //   channel:
    //     userData.name > selectedReceiver?.name
    //       ? `presence-${selectedReceiver?.name}-${userData.name}`
    //       : `presence-${userData.name}-${selectedReceiver?.name}`,
    // });
  };

  const handleConversationClick = async (selectedDispatcher: Dispatcher) => {
    if (selectedReceiver === selectedDispatcher) return;
    setChats([]);
    setMessageNotification({ seen: true });
    setSelectedReceiver(selectedDispatcher);
    navigate("/public-chat/123");
  };

  React.useEffect(() => {
    handleConversationClick(dispachersData[0]);
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  undefined;

  const [files, setFiles] = React.useState<File[] | null>(null);

  const [fileUploadProgress, setUploadFileProgress] =
    React.useState<FileUploadProgressTrackerType>();

  function cancelAllUploadsWithProgress(
    fileUploadProgress: FileUploadProgressTrackerType | undefined
  ) {
    if (fileUploadProgress) {
      Object.keys(fileUploadProgress).forEach((key) => {
        fileUploadProgress[key].snapshot.task.cancel();
      });
    }
  }
  //fetch mesg according to selected dispatcher
  React.useEffect(() => {
    async function fetchNewMesg() {
      const response = await axios.get(
        `http://localhost:8000/api/message/${userData.name}/${selectedReceiver?.name}`
      );

      setChats(response.data);
    }

    if (selectedReceiver) {
      fetchNewMesg();
      setFiles(null);
      cancelAllUploadsWithProgress(fileUploadProgress);
      setUploadFileProgress(undefined);
    }
  }, [selectedReceiver]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...event.target.files]);
      cancelAllUploadsWithProgress(fileUploadProgress);
      setUploadFileProgress(undefined);
    }
  };

  const uploadFileToDB = (item: File) => {
    const metadata = {
      contentType: item.type,
    };

    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();

    const fileName = `${item.name}-${currentTimestamp}`;

    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, item, metadata);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setUploadFileProgress((oldData) => ({
          ...oldData,
          [item.name]: { progress, snapshot },
        }));

        switch (snapshot.state) {
          case "paused":
            console.log("File upload paused");
            break;
          case "canceled":
            console.log("File upload cancelled");
            break;
          case "success":
            console.log("Success");
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log("Error occured", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          console.log(`File upload success at : ${downloadURL}`);
          if (!selectedReceiver) return;
          const channelName =
            userData.name > selectedReceiver?.name
              ? `presence-${selectedReceiver?.name}-${userData.name}`
              : `presence-${userData.name}-${selectedReceiver?.name}`;
          await axios.post("http://localhost:8000/api/message/file", {
            userName: userData.name,
            fileURL: downloadURL,
            reciverName: selectedReceiver?.name,
            channel: channelName,
            fileName: item.name,
          });
        });
        setFiles((allFiles) => {
          if (allFiles?.length === 1) {
            return null;
          } else {
            return (
              allFiles?.filter(
                (fileToUpload) => fileToUpload.name !== item.name
              ) || null
            );
          }
        });
        setUploadFileProgress((allProgress) => {
          if (allProgress) {
            delete allProgress[fileName];
            return allProgress;
          }
        });
      }
    );
  };

  const handleFileUpload = () => {
    files?.forEach(async (file) => {
      await uploadFileToDB(file);
    });
  };

  const logoutHandler = () => {
    localStorage.clear();

    localStorage.setItem("loggedOut", "true");

    pusherClient.channels.all().forEach((channel) => {
      channel.unbind_all();
      pusherClient.unsubscribe(channel.name);
    });

    navigate("/");
  };

  return (
    <div className="h-[100vh] w-full flex justify-center items-center">
      <button
        onClick={logoutHandler}
        className="absolute bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded top-2 right-[5%] z-50"
      >
        LogOut
      </button>
      <div className="h-[80%] w-[90%] ">
        <MainContainer responsive>
          <Sidebar position="left" scrollable={true}>
            <ConversationList>
              {dispachersData.map((dispatcher: Dispatcher) => {
                if (dispatcher?.name === userData?.name) {
                  return;
                }

                return (
                  <Conversation
                    className={`${
                      dispatcher.name === selectedReceiver?.name
                        ? "bg-gray-500"
                        : ""
                    } ${
                      messageNotification.senderUserName === dispatcher.name &&
                      !messageNotification.seen
                        ? "bg-red-400"
                        : ""
                    }`}
                    onClick={() => handleConversationClick(dispatcher)}
                  >
                    <Avatar
                      name={dispatcher.name}
                      status="available"
                      src={dispatcher.profilePic}
                    />
                    <Conversation.Content
                      name={dispatcher.name}
                      info={
                        dispatcher.name !== messageNotification.senderUserName
                          ? ""
                          : messageNotification.message
                      }
                      lastSenderName={
                        dispatcher.name !== messageNotification.senderUserName
                          ? false
                          : messageNotification.senderUserName
                      }
                    />
                    <Avatar
                      src={dispatcher.profilePic}
                      status={
                        onlineDispatchers.includes(`${dispatcher.id}`)
                          ? "available"
                          : "unavailable"
                      }
                    />
                  </Conversation>
                );
              })}
            </ConversationList>
          </Sidebar>
          <ChatContainer>
            {selectedReceiver?.name && (
              <ConversationHeader>
                <Avatar
                  src={selectedReceiver.profilePic}
                  name={selectedReceiver?.name}
                />
                <ConversationHeader.Content userName={selectedReceiver?.name} />
                <ConversationHeader.Actions>
                  <StarButton title="Add to favourites" />
                  <VoiceCallButton title="Start voice call" />
                  <VideoCallButton title="Start video call" />
                  <InfoButton title="Show info" />
                </ConversationHeader.Actions>
              </ConversationHeader>
            )}

            <MessageList
              typingIndicator={
                isTypingData.isTyping &&
                isTypingData.senderName === selectedReceiver?.name &&
                userData.name !== isTypingData.senderName && (
                  <TypingIndicator
                    content={`${selectedReceiver?.name} is typing: ${isTypingData.message}`}
                  />
                )
              }
            >
              {chats.map((chat) => {
                if (chat.type) {
                  const isImage = fileImgTypes.includes(
                    chat.message.split(".")[1].toUpperCase()
                  );
                  return (
                    <Message
                      key={chat.userName}
                      model={{
                        type: "html",
                        direction:
                          chat.userName === userData.name
                            ? "outgoing"
                            : "incoming",
                        position: "normal",
                      }}
                    >
                      <Avatar
                        name={chat.userName}
                        src={
                          chat.userName === userData.name
                            ? userData?.profilePic
                            : selectedReceiver?.profilePic
                        }
                      />
                      <Message.HtmlContent
                        html={
                          !isImage
                            ? `<strong class="file-message"> <a href=${chat.fileURL}>${chat.message}</a> </strong>`
                            : `<a href=${chat.fileURL}> <img src=${chat.fileURL} width="200px" height="200px" alt="${chat.message}"/></a> `
                        }
                      />
                    </Message>
                  );
                }
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
                        src={
                          chat.userName === userData.name
                            ? userData?.profilePic
                            : selectedReceiver?.profilePic
                        }
                      />
                    </Message>
                  </>
                );
              })}
              {files && files?.length && (
                <ExpansionPanel
                  title="Files"
                  open={true}
                  className="absolute bottom-0 w-[80%] left-[5rem] "
                >
                  <div className="flex-col gap-y-8 justify-between h-[40vh]">
                    {files.map((file) => {
                      return (
                        <FileNameCard
                          setUploadFileProgress={setUploadFileProgress}
                          fileName={file.name}
                          filesUploadProgress={fileUploadProgress}
                          setFiles={setFiles}
                        />
                      );
                    })}
                  </div>
                </ExpansionPanel>
              )}
            </MessageList>

            {selectedReceiver?.name && (
              <MessageInput
                sendDisabled={false}
                placeholder="Type message here"
                onChange={(text) => {
                  setMessage(text);
                  isTypingHandler();
                }}
                value={message || " "}
                onSend={() => {
                  if (message.length > 0) {
                    submitMessage();
                    setMessage("");
                  }
                  if (files) {
                    handleFileUpload();
                  }
                }}
                onAttachClick={() => fileInputRef.current?.click()}
              />
            )}
          </ChatContainer>
        </MainContainer>
        <input
          type="file"
          multiple
          onChange={handleChange}
          hidden
          ref={fileInputRef}
        />
      </div>
    </div>
  );
}
