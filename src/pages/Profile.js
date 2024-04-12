import React, { useCallback, useRef, useState } from "react";
import Header from "../components/Header";
import ImageCompressor from "image-compressor.js";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { auth, db, storage } from "../config/Firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { updateUser } from "../config/Redux/Reducers/UserSlice";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Loader from "../components/Loader/Loader";
import showSwal from "../components/AlertError";

function Profile() {
  const selectUser = useSelector((state) => state.userReducer.user);
  const [imgSRC, setimgSRC] = useState(selectUser.photoURL);
  const [compressedImage, setCompressedImage] = useState(null);
  const [userImg, setUserImg] = useState([]);
  const [isLoader, setIsLoader] = useState(false);

  const name = useRef();
  const oldPassword = useRef();
  const password = useRef();
  const repeatPassword = useRef();
  const dispatch = useDispatch();

  const uploadImgFunc = useCallback((e) => {
    const file = e.target.files[0];
    const maxSize = 1024 * 1024;
    const maxImageSize = 100; // Maximum desired image size in pixels

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

  const updatedUser = useCallback(async (e) => {
    e.preventDefault();
    if (compressedImage) {
      setIsLoader(true);
      const storageRef = ref(
        storage,
        `usersimg/${selectUser.uid}/${selectUser.uid}`
      );
      const uploadTask = uploadBytesResumable(storageRef, compressedImage);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          switch (snapshot.state) {
            case "paused":
              break;
            case "running":
              break;
          }
        },
        (error) => {
          showSwal(error);
          setIsLoader(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "users", selectUser.uid), {
              photoURL: downloadURL,
            });
            dispatch(
              updateUser({
                name: name.current.value.trim(),
                email: selectUser.email,
                photoURL: downloadURL,
                uid: selectUser.uid,
                authenticat: selectUser.authenticat,
              })
            );
          });
          setIsLoader(false);
        }
      );
    }
    if (
      name.current.value.trim() &&
      name.current.value.trim() !== selectUser.name
    ) {
      setIsLoader(true);

      dispatch(
        updateUser({
          name: name.current.value.trim(),
          email: selectUser.email,
          photoURL: selectUser.photoURL,
          uid: selectUser.uid,
          authenticat: selectUser.authenticat,
        })
      );
      const userRef = doc(db, "users", selectUser.uid);
      await updateDoc(userRef, {
        name: name.current.value.trim(),
      });
      setIsLoader(false);
    }
    if (selectUser.authenticat !== "google") {
      const user = auth.currentUser;
      if (
        oldPassword.current.value &&
        password.current.value &&
        repeatPassword.current.value &&
        password.current.value === repeatPassword.current.value
      ) {
        setIsLoader(true);
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          oldPassword.current.value
        );

        reauthenticateWithCredential(user, credential)
          .then(() => {
            updatePassword(user, password.current.value)
              .then(() => {
                setIsLoader(false);
                oldPassword.current.value = "";
                password.current.value = "";
                repeatPassword.current.value = "";
              })
              .catch((error) => {
                setIsLoader(false);
                showSwal(error);
              });
          })
          .catch(() => {
            setIsLoader(false);
            showSwal("old password incorrect");
          });
      }
    }
  });

  return (
    <>
      <div className="chat-app-wrapper" style={{ height: "100%" }}>
        {isLoader && <Loader />}
        <Header />
        <div className="account-wrapper">
          <div className="columns">
            <div className="column is-12">
              <div className="account-box is-form is-footerless">
                <div className="form-body">
                  {/*Fieldset*/}
                  <div className="fieldset">
                    <div className="fieldset-heading">
                      <h4>Profile Picture</h4>
                      <p>This is how others will recognize you</p>
                    </div>
                    <div className="h-avatar profile-h-avatar is-xl">
                      {/* <img
                        className="avatar "
                        src="https://lh3.googleusercontent.com/a/ACg8ocJ05s86XdKgF8gsgG5iMLnjcs5u8DaS-yGqg1G2J9g6wGo=s96-c"
                        alt=""
                      />
                      <div className="filepond-profile-wrap">
                        <div
                          className="filepond--root profile-filepond filepond--hopper"
                          data-style-panel-layout="compact circle"
                          data-style-button-remove-item-position="left bottom"
                          data-style-button-process-item-position="right bottom"
                          data-style-load-indicator-position="center bottom"
                          data-style-progress-indicator-position="right bottom"
                          data-style-button-remove-item-align="false"
                          data-style-image-edit-button-edit-item-position="bottom center"
                          style={{ height: 100 }}
                        >
                          <input
                            className="filepond--browser"
                            type="file"
                            id="filepond--browser-du7da6q70"
                            aria-controls="filepond--assistant-du7da6q70"
                            aria-labelledby="filepond--drop-label-du7da6q70"
                            name="profile_filepond"
                          />
                          <a
                            className="filepond--credits"
                            aria-hidden="true"
                            href="https://pqina.nl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ transform: "translateY(100px)" }}
                          >
                            Powered by PQINA
                          </a>
                          <div
                            className="filepond--drop-label"
                            style={{
                              transform: "translate3d(0px, 0px, 0px)",
                              opacity: 1,
                            }}
                          >
                            <label
                              htmlFor="filepond--browser-du7da6q70"
                              id="filepond--drop-label-du7da6q70"
                              aria-hidden="true"
                            >
                              <i className="lnil lnil-cloud-upload" />
                            </label>
                          </div>
                          <div
                            className="filepond--list-scroller"
                            style={{ transform: "translate3d(0px, 0px, 0px)" }}
                          >
                            <ul className="filepond--list" role="list" />
                          </div>
                          <div
                            className="filepond--panel filepond--panel-root"
                            data-scalable="false"
                          >
                            <div className="filepond--panel-top filepond--panel-root" />
                            <div
                              className="filepond--panel-center filepond--panel-root"
                              style={{
                                transform:
                                  "translate3d(0px, 0px, 0px) scale3d(1, 1, 1)",
                              }}
                            />
                            <div
                              className="filepond--panel-bottom filepond--panel-root"
                              style={{
                                transform: "translate3d(0px, 100px, 0px)",
                              }}
                            />
                          </div>
                          <div className="filepond--drip" />
                          <span
                            className="filepond--assistant"
                            id="filepond--assistant-du7da6q70"
                            role="status"
                            aria-live="polite"
                            aria-relevant="additions"
                          />
                          <fieldset className="filepond--data" />
                        </div>
                      </div>
                      <button className="button is-circle edit-button is-edit">
                        <span className="icon is-small">
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
                            className="feather feather-edit-2"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </span>
                      </button> */}

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
                    </div>
                  </div>
                  {/*Fieldset*/}
                  <div className="fieldset">
                    <div className="fieldset-heading">
                      <h4>Personal Info</h4>
                    </div>
                    <div className="columns is-multiline">
                      {/*Field*/}
                      <div className="column is-12">
                        <div className="field">
                          <div className="control has-icon">
                            <input
                              type="text"
                              className="input"
                              placeholder="Name"
                              defaultValue={selectUser.name}
                              ref={name}
                            />
                            <div className="form-icon">
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
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectUser.authenticat !== "google" ? (
                        <>
                          {/*Field*/}
                          <div className="column is-12">
                            <div className="field">
                              <div className="control has-icon">
                                <input
                                  type="password"
                                  className="input"
                                  placeholder="Old Password"
                                  ref={oldPassword}
                                />
                                <div className="form-icon">
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
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*Field*/}
                          <div className="column is-12">
                            <div className="field">
                              <div className="control has-icon">
                                <input
                                  type="password"
                                  className="input"
                                  placeholder="New Password"
                                  ref={password}
                                />
                                <div className="form-icon">
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
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*Field*/}
                          <div className="column is-12">
                            <div className="field">
                              <div className="control has-icon">
                                <input
                                  type="password"
                                  className="input"
                                  placeholder="Repeat New Password"
                                  ref={repeatPassword}
                                />
                                <div className="form-icon">
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
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div className="forms-btn">
                      <div>
                        <div className="buttons">
                          <Link
                            to={"/"}
                            className="button h-button is-light is-dark-outlined"
                          >
                            <span className="icon">
                              <i className="lnir lnir-arrow-left rem-100" />
                            </span>
                            <span>Go Back</span>
                          </Link>
                          <button
                            onClick={updatedUser}
                            id="save-button"
                            className="button h-button is-primary is-raised"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
