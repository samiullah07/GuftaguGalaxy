import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../config/Firebase";
import Moment from "react-moment";
import { MdWatchLater } from "react-icons/md";
import MessageBox from "../MessageBox";
import { FaUserCircle } from "react-icons/fa";

function ConversationBox({ user, scrollToBottom, setIsArea }) {
  const { name, photoURL, uid } = user;
  const [messages, setAllmessages] = useState([]);
  const [chatLoader, setChatLoader] = useState(false);

  const reduxUser = useSelector((state) => state.userReducer.user);
  const messageInp = useRef();

  const notificationDelete = useCallback(async (uid, reduxUser) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const docSnapshot = await getDoc(userDocRef);
      const userData = docSnapshot.data();

      if (userData && userData.notifications) {
        const notificationsArray = userData.notifications;

        const notificationToUpdate = notificationsArray.find(
          (noti) => noti.uid === reduxUser.uid
        );

        if (notificationToUpdate) {
          notificationToUpdate.notificationCount = null;
        }

        try {
          await updateDoc(userDocRef, {
            notifications: notificationsArray,
          });
        } catch (error) {}
      }
    } catch (error) {}
  });

  useEffect(() => {
    setChatLoader(true);
    messageInp.current.value = "";
    let chatId;
    if (uid < reduxUser.uid) {
      chatId = uid + reduxUser.uid;
    } else {
      chatId = reduxUser.uid + uid;
    }
    const messagesRef = collection(db, "messages");
    const docRef = doc(messagesRef, chatId);
    const subcollectionRef = query(
      collection(docRef, "messages"),
      orderBy("timestamp")
    );
    const getmessages = [];
    const unsubscribe = onSnapshot(subcollectionRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          getmessages.push(change.doc.data());
        }
        if (change.type === "modified") {
          getmessages.pop();
          getmessages.push(change.doc.data());
          messageInp.current.disabled = false;
          messageInp.current.focus();
        }
      });
      setAllmessages([...getmessages]);
      notificationDelete(uid, reduxUser);
    });

    setChatLoader(false);
    return () => {
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <>
      {/*Conversation 1*/}
      <div
        className={`simplebar-content has-loader ${
          chatLoader && "has-loader-active"
        }`}
        style={{ padding: 0 }}
      >
        <div className="h-loader-wrapper">
          <div className="loader is-loading"></div>
        </div>
        <div id="webapp-conversation-1" className="chat-area-content is-active">
          <div className="chat-area-header">
            <button
              className="trigger conversations-mobile-trigger h-only-mobile h-only-tablet-p h-only-tablet-l"
              onClick={() => {
                setIsArea(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-menu"
              >
                <line x1={3} y1={12} x2={21} y2={12} />
                <line x1={3} y1={6} x2={21} y2={6} />
                <line x1={3} y1={18} x2={21} y2={18} />
              </svg>
            </button>
            <div className="chat-area-title">{name}</div>
            <div className="chat-area-group">
              {/* <img
                className="chat-area-profile"
                src={photoURL}
                style={{ height: "40px", width: "40px" }}
                data-user-popover={13}
              /> */}
              {photoURL ? (
                <img
                  src={photoURL}
                  className="chat-area-profile"
                  style={{ height: "40px", width: "40px" }}
                  data-user-popover={13}
                  alt={name.toLowerCase()}
                />
              ) : (
                <FaUserCircle
                  className="avatar chat-area-profile"
                  style={{ height: "40px", width: "40px" }}
                />
              )}
            </div>
          </div>
          <div className="chat-area-main">
            <div>
              {messages.map((message) => {
                return (
                  <div
                    className={`chat-msg ${
                      message.uid === reduxUser.uid && "owner"
                    }`}
                    key={message.id}
                  >
                    <div className="chat-msg-profile">
                      {photoURL ? (
                        <img
                          src={
                            message.uid === reduxUser.uid
                              ? reduxUser.photoURL
                              : photoURL
                          }
                          className="chat-msg-img"
                          alt={
                            message.uid === reduxUser.uid
                              ? reduxUser.name.toLowerCase()
                              : name.toLowerCase()
                          }
                        />
                      ) : (
                        <FaUserCircle className="avatar chat-msg-img" />
                      )}
                      <div className="chat-msg-date">
                        {message.timestamp ? (
                          <span>
                            {"Sent at "}
                            <Moment interval={100} fromNow>
                              {new Date(message.timestamp.seconds * 1000)}
                            </Moment>
                          </span>
                        ) : (
                          <MdWatchLater style={{ marginTop: "10px" }} />
                        )}
                      </div>
                    </div>
                    <div className="chat-msg-content">
                      <div className="chat-msg-text">{message.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {!chatLoader && <MessageBox uid={uid} messageInp={messageInp} />}
        </div>
      </div>
    </>
  );
}

export default ConversationBox;
