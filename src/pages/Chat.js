import React, { useCallback, useRef, useState } from "react";

import Header from "../components/Header";
import { useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/Firebase";
import Users from "../components/Users";
import ConversationBox from "../components/ConversationBox";
import { useSelector } from "react-redux";

function Chat() {
  const [allUser, setAllUsers] = useState([]);
  const [showUserChat, setShowUserChat] = useState({});
  const [userLoader, setuserLoader] = useState(false);
  const [isArea, setIsArea] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const userUid = useSelector((state) => state.userReducer.user.uid);
  const divRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  });

  useEffect(() => {
    setuserLoader(true);
    const callMe = async () => {
      const q = query(collection(db, "users"), where("uid", "!=", userUid));
      onSnapshot(q, (querySnapshot) => {
        const allUser = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.notifications) {
            let added = false;
            for (let i = 0; i < userData.notifications.length; i++) {
              const element = userData.notifications[i];
              if (
                element.uid === userUid &&
                element.notificationCount !== null
              ) {
                allUser.unshift(userData); // Top mein add karna
                added = true;
                break;
              }
            }
            if (!added) {
              allUser.push(userData);
            }
          } else {
            allUser.push(userData);
          }
        });
        setAllUsers([...allUser]);
      });
    };
    callMe();
    setuserLoader(false);
  }, []);

  const showChat = useCallback(
    (id) => {
      const found = allUser.find((user) => user.uid === id);
      setShowUserChat(found);
    },
    [allUser]
  );

  useEffect(() => {
    const handleBlur = async () => {
      const offline = doc(db, "users", userUid);
      try {
        await updateDoc(offline, { useronoff: false });
      } catch (error) {}
    };

    const handleBeforeUnload = async () => {
      const offline = doc(db, "users", userUid);
      try {
        await updateDoc(offline, { useronoff: false });
      } catch (error) {}
    };

    const handleFocus = async () => {
      const offline = doc(db, "users", userUid);
      try {
        await updateDoc(offline, { useronoff: true });
      } catch (error) {}
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  return (
    <>
      <div className="chat-app-wrapper ">
        <Header setSearchVal={setSearchVal} />
        {/*Chat app wrapper*/}
        <div className="wrapper">
          {/*Conversation List*/}
          {/*Conversations list*/}
          <div
            className={`conversation-area ${isArea && "is-active"}`}
            data-simplebar="init"
          >
            <div className="simplebar-wrapper" style={{ margin: 0 }}>
              <div className="simplebar-height-auto-observer-wrapper">
                <div className="simplebar-height-auto-observer" />
              </div>
              <div className="simplebar-mask">
                <div
                  className="simplebar-offset"
                  style={{ right: 0, bottom: 0 }}
                >
                  <div
                    className={`simplebar-content-wrapper has-loader ${
                      userLoader && "has-loader-active"
                    }`}
                    style={{ height: "100%", overflow: "hidden scroll" }}
                  >
                    <div className="h-loader-wrapper">
                      <div className="loader  is-loading"></div>
                    </div>
                    <div className="simplebar-content " style={{ padding: 0 }}>
                      {searchVal
                        ? allUser.map((users) => {
                            if (
                              users.name
                                .toLowerCase()
                                .includes(searchVal.toLowerCase())
                            ) {
                              const notiWithMyId =
                                users.notifications &&
                                users.notifications.find(
                                  (noti) => noti.uid === userUid
                                );
                              const foundNotificationCount = notiWithMyId
                                ? notiWithMyId.notificationCount
                                : undefined;

                              return (
                                <div key={users.uid}>
                                  <Users
                                    name={users.name}
                                    key={users.uid}
                                    img={users.photoURL}
                                    id={users.uid}
                                    showChat={showChat}
                                    isActive={showUserChat.uid}
                                    isOnline={users.useronoff}
                                    notifications={foundNotificationCount}
                                    setIsArea={setIsArea}
                                  />
                                </div>
                              );
                            }
                          })
                        : allUser.map((users, i) => {
                            const notiWithMyId =
                              users.notifications &&
                              users.notifications.find(
                                (noti) => noti.uid === userUid
                              );
                            const foundNotificationCount = notiWithMyId
                              ? notiWithMyId.notificationCount
                              : undefined;

                            return (
                              <div key={users.uid}>
                                <Users
                                  name={users.name}
                                  key={users.uid}
                                  img={users.photoURL}
                                  id={users.uid}
                                  showChat={showChat}
                                  isActive={showUserChat.uid}
                                  isOnline={users.useronoff}
                                  notifications={foundNotificationCount}
                                  setIsArea={setIsArea}
                                />
                              </div>
                            );
                          })}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="simplebar-placeholder"
                style={{ width: "auto", height: 880 }}
              />
            </div>
            <div
              className="simplebar-track simplebar-horizontal"
              style={{ visibility: "hidden" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{ width: 0, display: "none" }}
              />
            </div>
            <div
              className="simplebar-track simplebar-vertical"
              style={{ visibility: "visible" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{
                  height: 88,
                  transform: "translate3d(0px, 0px, 0px)",
                  display: "block",
                }}
              />
            </div>
          </div>
          {/*Conversation messages*/}
          <div className="chat-area" data-simplebar="init">
            <div className="simplebar-wrapper" style={{ margin: 0 }}>
              <div className="simplebar-height-auto-observer-wrapper">
                <div className="simplebar-height-auto-observer" />
              </div>
              <div className="simplebar-mask">
                <div
                  className="simplebar-offset"
                  style={{ right: 0, bottom: 0 }}
                >
                  <div
                    className="simplebar-content-wrapper"
                    style={{ height: "100%", overflow: "hidden scroll" }}
                    ref={divRef}
                  >
                    <div className="simplebar-content" style={{ padding: 0 }}>
                      {showUserChat.name ? (
                        <div>
                          <ConversationBox
                            user={showUserChat}
                            scrollToBottom={scrollToBottom}
                            setIsArea={setIsArea}
                          />
                        </div>
                      ) : (
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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="simplebar-placeholder"
                style={{ width: 669, height: 1291 }}
              />
            </div>
            <div
              className="simplebar-track simplebar-horizontal"
              style={{ visibility: "hidden" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{ width: 0, display: "none" }}
              />
            </div>
            <div
              className="simplebar-track simplebar-vertical"
              style={{ visibility: "visible" }}
            >
              <div
                className="simplebar-scrollbar"
                style={{
                  height: 60,
                  transform: "translate3d(0px, 219px, 0px)",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
