import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
      const chatData = res.data();
      setChat(chatData);

      if (chatData && currentUser.id !== user.id) {
        const unreadMessages = chatData.messages.filter(
          (msg) => msg.senderId !== currentUser.id && msg.status !== "seen"
        );

        for (const msg of unreadMessages) {
          if (msg.status === "sent") {
            await updateMessageStatus(msg.id, "delivered");
          } else if (document.hasFocus()) {
            await updateMessageStatus(msg.id, "seen");
          }
        }
      }
    });

    return () => {
      unSub();
    };
  }, [chatId, currentUser.id, user.id]);

  useEffect(() => {
    const handleFocus = async () => {
      if (chat && currentUser.id !== user.id) {
        const unreadMessages = chat.messages.filter(
          (msg) => msg.senderId !== currentUser.id && msg.status !== "seen"
        );

        for (const msg of unreadMessages) {
          await updateMessageStatus(msg.id, "seen");
        }
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [chat, currentUser.id, user.id]);

  const updateMessageStatus = async (messageId, status) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      const updatedMessages = chatDoc.data().messages.map((message) => {
        if (message.id === messageId) {
          return { ...message, status };
        }
        return message;
      });

      await updateDoc(chatRef, { messages: updatedMessages });
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const newMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        text,
        createdAt: new Date(),
        status: "sent",
        ...(imgUrl && { img: imgUrl }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(newMessage),
      });

      const userIDs = [currentUser.id, user.id];

      await Promise.all(
        userIDs.map(async (id) => {
          const userChatsRef = doc(db, "userchats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatsData = userChatsSnapshot.data();

            const chatIndex = userChatsData.chats.findIndex(
              (c) => c.chatId === chatId
            );

            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  const sendMessage = async () => {
    if (text.trim() === "") return;
    await handleSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Hey There! I&apos;m on Firechat</p>
          </div>
        </div>
        <div className="icons">
          <img src="./info.svg" alt="" />
        </div>
      </div>
      <div className="center">
        {/* <div className="chat-wallpaper"></div> */}
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message.createdAt.toDate().getTime()}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
              {message.senderId === currentUser?.id && (
                <span className={`status ${message.status}`}>
                  {message.status === "sent" && "✓"}
                  {message.status === "delivered" && "✓✓"}
                  {message.status === "seen" && "✓✓"}
                </span>
              )}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./attachment.svg" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.svg"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={sendMessage}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
