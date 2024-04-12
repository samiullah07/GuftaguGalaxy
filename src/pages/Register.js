import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import AuthHeader from "../components/AuthHeader";
import Loader from "../components/Loader/Loader";
import { auth, db, storage } from "../config/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ImageCompressor from "image-compressor.js";
import { FaUserCircle } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import showSwal from "../components/AlertError";

let userRegister = true;
let userGoogle = true;

function Register() {
  const navigate = useNavigate();

  const [isUser, setIsUser] = useState(null);
  const [isRegister, setIsRegister] = useState(true);
  const [isGoogle, setIsGoogle] = useState(true);
  
  const [compressedImage, setCompressedImage] = useState(null);
  const [userImg, setUserImg] = useState([]);
  const [imgSRC, setimgSRC] = useState(null);

  const name = useRef();
  const email = useRef();
  const password = useRef();
  const repeatPassword = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (userRegister) {
        if (user) {
          navigate("/");
          setIsUser(null);
        } else {
          setIsUser(true);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const uploadImgFunc = useCallback((e) => {
    const file = e.target.files[0];
    const maxSize = 1024 * 1024;
    const maxImageSize = 100;
    if (e.target.files.length !== 0) {
      if (
        file.size < maxSize &&
        (file.type === "image/jpeg" || file.type === "image/png")
      ) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
          const tempURL = e.target.result;
          setimgSRC(tempURL);
          const img = new Image();
          img.src = reader.result;
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Calculate new dimensions
            let newWidth, newHeight;
            if (img.width > img.height) {
              newWidth = maxImageSize;
              newHeight = (maxImageSize * img.height) / img.width;
            } else {
              newHeight = maxImageSize;
              newWidth = (maxImageSize * img.width) / img.height;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob(
              async (blob) => {
                // Convert to JPEG Blob
                const jpegBlob = await new Promise((resolve) =>
                  canvas.toBlob(resolve, "image/jpeg")
                );

                // Compress the JPEG Blob
                new ImageCompressor(jpegBlob, {
                  quality: 0.7, // Adjust quality (0.3 = 30%)
                  success(result) {
                    setCompressedImage(result);
                  },
                  error(e) {
                    console.error(e.message);
                  },
                });
              },
              "image/jpeg",
              0.9
            );
          };
        };
      } else {
          showSwal("file size exceeds 1MB and type only image");
        setimgSRC(null);
      }
    } else {
      setUserImg([]);
      setimgSRC(null);
    }
  });

  const registerUser = useCallback((e) => {
    e.preventDefault();
    if (
      name.current.value.trim() &&
      email.current.value.trim() &&
      password.current.value.trim() &&
      repeatPassword.current.value.trim()
    ) {
      setIsRegister(false);
      userRegister = false;
      createUserWithEmailAndPassword(
        auth,
        email.current.value.trim(),
        password.current.value.trim()
      )
        .then((userCredential) => {
          const user = userCredential.user;
          if (compressedImage) {
            const storageRef = ref(storage, `usersimg/${user.uid}/${user.uid}`);
            const uploadTask = uploadBytesResumable(
              storageRef,
              compressedImage
            );
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                switch (snapshot.state) {
                  case "paused":
                    break;
                  case "running":
                    break;
                }
              },
              (error) => {
                showSwal(error)
              },
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then(
                  async (downloadURL) => {
                    await setDoc(doc(db, "users", user.uid), {
                      name: name.current.value.trim(),
                      email: user.email,
                      photoURL: downloadURL,
                      uid: user.uid,
                    });

                    navigate("/");
                  }
                );
              }
            );
          } else {
            async function callMe() {
              try {
                await setDoc(doc(db, "users", user.uid), {
                  name: name.current.value.trim(),
                  email: user.email,
                  photoURL: null,
                  uid: user.uid,
                });

                navigate("/");
              } catch (error) {
                showSwal("Error while setting document", error);
              }
            }

            callMe();
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          if (errorCode === "auth/invalid-email") {
            showSwal("invalid email");
          }
          if (errorCode === "auth/network-request-failed") {
            showSwal("no internet available");
          }
          if (errorCode === "auth/weak-password") {
            showSwal("weak password minimum password 6 characters");
          }
          if (errorCode === "auth/email-already-in-use") {
            showSwal("this email is already registered");
          }
        });
    }
  });

  const authGoogle = useCallback(() => {
    userGoogle = false;
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
          showSwal(errorMessage);
          setIsGoogle(true);
        }
      });
  });

  return (
    <>
      {isUser !== null ? (
        <div>
          <div className="auth-wrapper">
            {/*Page body*/}
            <div className="auth-wrapper-inner is-single">
              {/*Fake navigation*/}
              <AuthHeader />
              {/*Single Centered Form*/}
              <div className="single-form-wrap register">
                <div className="inner-wrap">
                  {/*Form Title*/}
                  <div className="auth-head">
                    <h2>Join Us Now.</h2>
                    <p>Start by creating your account</p>
                    <Link to="/login">I already have an account </Link>
                  </div>
                  {/*Form*/}
                  <div className="form-card">
                    <form onSubmit={registerUser}>
                      <div id="signin-form" className="login-form">
                        <div className="userIcon">
                          <div className="uploadImg">
                            {imgSRC ? (
                              <img
                                src={imgSRC}
                                alt=""
                                id="userImg"
                                onClick={() => {
                                  document.getElementById("uploudImg").click();
                                }}
                                className="userI"
                              />
                            ) : (
                              <FaUserCircle
                                className="userI"
                                onClick={() => {
                                  document.getElementById("uploudImg").click();
                                }}
                              />
                            )}

                            <div className="UploadText">Upload Image</div>
                          </div>
                          <input
                            type="file"
                            files={userImg}
                            name="uploudImg"
                            className="userimginp"
                            accept=".jpg, .png"
                            id="uploudImg"
                            onChange={(e) => {
                              uploadImgFunc(e);
                            }}
                          />
                        </div>
                        {/* Input */}
                        <div className="field">
                          <div className="control has-icon">
                            <input
                              className="input"
                              type="text"
                              placeholder="Name"
                              ref={name}
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
                                className="feather feather-user"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx={12} cy={7} r={4} />
                              </svg>
                            </span>
                          </div>
                        </div>
                        {/* Input */}
                        <div className="field">
                          <div className="control has-icon">
                            <input
                              className="input"
                              type="email"
                              placeholder="Email Address"
                              ref={email}
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
                              placeholder="Password"
                              ref={password}
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
                        {/* Input */}
                        <div className="field">
                          <div className="control has-icon">
                            <input
                              className="input"
                              type="password"
                              placeholder="Repeat Password"
                              ref={repeatPassword}
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
                            className="button h-button is-primary is-bold is-fullwidth is-raised "
                            type="submit"
                          >
                            {isRegister ? (
                              "Sign Up"
                            ) : (
                              <div className="h-loader-wrapper">
                                <div className="loader is-loading"></div>
                              </div>
                            )}
                          </button>
                          <h5 className=" UploadText text-center">Or</h5>
                          <button
                            id="confirm-step-1"
                            type="button"
                            className="button h-button is-light is-bold is-fullwidth is-raised"
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
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default Register;
