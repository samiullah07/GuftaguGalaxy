import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../config/Firebase";
import { IoSend } from "react-icons/io5";
import showSwal from "../AlertError";

function MessageBox({ uid, messageInp }) {
  const [inp, setInp] = useState("");
  const myId = useSelector((state) => state.userReducer.user.uid);

  const sendMessage = useCallback(async () => {
    if (inp.trim()) {
      let chatId;
      if (uid < myId) {
        chatId = uid + myId;
      } else {
        chatId = myId + uid;
      }

      try {
        function generateRandomId(length) {
          const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let randomId = "";
          const charactersLength = characters.length;
          for (let i = 0; i < length; i++) {
            randomId += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }
          return randomId;
        }

        const randomId = generateRandomId(10);

        const messagesRef = collection(db, "messages");
        const docRef = doc(messagesRef, chatId);
        const subcollectionRef = collection(docRef, "messages");
        const nowMessage = inp.trim();
        setInp("");
        messageInp.current.disabled = true;
        await addDoc(subcollectionRef, {
          value: nowMessage,
          timestamp: serverTimestamp(),
          uid: myId,
          id: randomId,
        });

        try {
          const userDocRef = doc(db, "users", myId);
          const docSnapshot = await getDoc(userDocRef);
          const userData = docSnapshot.data();
          const notificationsArray = userData.notifications || [];
          const index = notificationsArray.findIndex(
            (item) => item.uid === uid
          );
          if (index !== -1) {
            notificationsArray[index].notificationCount += 1;
          } else {
            notificationsArray.push({
              uid: uid,
              notificationCount: 1,
            });
          }
          try {
            await updateDoc(userDocRef, {
              notifications: notificationsArray,
            });
          } catch (error) {}
        } catch (error) {}
      } catch (error) {
        showSwal(error);
      }
    }
  });

  return (
    <>
      <div className="chat-area-footer">
        <input
          type="text"
          placeholder="Type something here..."
          ref={messageInp}
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
        />
        {inp.trim() && (
          <div className="">
            <IoSend className="sendBtn" onClick={sendMessage} />
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(MessageBox);
