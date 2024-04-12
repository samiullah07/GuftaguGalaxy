import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../config/Firebase";
import AuthHeader from "../components/AuthHeader";
import Loader from "../components/Loader/Loader";
import { FaGoogle } from "react-icons/fa";

import { doc, setDoc } from "firebase/firestore";
import showSwal from "../components/AlertError";

let googleLog = true;
function Login() {
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isGoogle, setIsGoogle] = useState(true);
  const email = useRef();
  const password = useRef();

  useEffect(() => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (googleLog) {
          if (user) {
            navigate("/");
            setIsUser(null);
          } else {
            setIsUser(true);
          }
        }
      });
    } catch (error) {
      setIsUser(true);
    }
  }, [navigate]);

  const loginUser = useCallback((e) => {
    e.preventDefault();
    if (email.current.value.trim() && password.current.value.trim()) {
      setIsLogin(false);
      signInWithEmailAndPassword(
        auth,
        email.current.value.trim(),
        password.current.value.trim()
      )
        .then((userCredential) => {
          navigate("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          if (errorCode === "auth/invalid-login-credentials") {
            showSwal("invalid login credentials");
            setIsLogin(true);
          }
        });
    }
  });

  const authGoogle = useCallback(() => {
    googleLog = false;
    setIsGoogle(false);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          authenticat: "google",
        });
        navigate("/");
      })
      .catch((error) => {
        const errorMessage = error.message;
        if (error.code === "auth/popup-closed-by-user") {
          setIsGoogle(true);
          showSwal("popup closed by user");
        } else {
          setIsGoogle(true);
          showSwal(errorMessage);
        }
      });
  });

  return (
    <>
      {isUser !== null ? (
        <div className="auth-wrapper">
          {/*Page body*/}
          <div className="auth-wrapper-inner is-single">
            {/*Fake navigation*/}
            <AuthHeader />
            {/*Single Centered Form*/}
            <div className="single-form-wrap">
              <div className="inner-wrap">
                {/*Form Title*/}
                <div className="auth-head">
                  <h2>Welcome Back.</h2>
                  <p>Please sign in to your account</p>
                  <Link to={"/register"}>I do not have an account yet</Link>
                </div>
                {/*Form*/}
                <div className="form-card">
                  <form onSubmit={loginUser}>
                    <div id="signin-form" className="login-form">
                      {/* Input */}
                      <div className="field">
                        <div className="control has-icon">
                          <input
                            className="input"
                            type="email"
                            ref={email}
                            placeholder="Email Address"
                          />
                          <span className="form-icon">
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
                              className="feather feather-mail"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      {/* Input */}
                      <div className="field">
                        <div className="control has-icon">
                          <input
                            className="input"
                            type="password"
                            ref={password}
                            placeholder="Password"
                          />
                          <span className="form-icon">
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
                              className="feather feather-lock"
                            >
                              <rect
                                x={3}
                                y={11}
                                width={18}
                                height={11}
                                rx={2}
                                ry={2}
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="control login">
                        <button
                          className="button h-button is-primary is-bold is-fullwidth is-raised"
                          type="submit"
                        >
                          {isLogin ? (
                            "Sign In"
                          ) : (
                            <div className="h-loader-wrapper">
                              <div className="loader is-loading"></div>
                            </div>
                          )}
                        </button>
                        <h5 className="UploadText text-center">Or</h5>
                        <button
                          id="confirm-step-1"
                          type="button"
                          className="button h-button is-light is-bold is-fullwidth is-raised "
                          onClick={authGoogle}
                        >
                          {isGoogle ? (
                            <>
                              <span className="GoogleI">
                                <FaGoogle />
                              </span>
                              <span>Sign Up With Google</span>
                            </>
                          ) : (
                            <div className="h-loader-wrapper">
                              <div className="loader is-loading"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default Login;
