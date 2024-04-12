import React, { useEffect, useState } from "react";
import { auth, db } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "../Redux/Reducers/UserSlice";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function ProtectedRoutes({ component }) {
  const [isUser, setIsUser] = useState(null);
  const dispatch = useDispatch();
  const navigat = useNavigate();

  useEffect(() => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const uid = user.uid;
          try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const { name, photoURL, email, uid, authenticat } =
                docSnap.data();
              dispatch(
                addUser({
                  name,
                  email,
                  photoURL,
                  uid,
                  authenticat,
                })
              );
              setIsUser(user);
            } else {
              dispatch(removeUser());
              navigat("/login");
            }
          } catch (error) {
            dispatch(removeUser());
            navigat("/login");
          }
        } else {
          setIsUser(null);
          navigat("/login");
        }
      });
    } catch (error) {
      setIsUser(null);
      navigat("/login");
    }
  }, []);

  return <>{isUser && component}</>;
}

export default ProtectedRoutes;
