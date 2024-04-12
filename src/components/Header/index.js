import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isTheme } from "../../config/Redux/Reducers/ThemeSlice";
import Logo from "../../assets/img/logos/logo/logo.svg";
import LogoLight from "../../assets/img/logos/logo/logo-light.svg";
import { auth, db } from "../../config/Firebase";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import showSwal from "../AlertError";
import { doc, updateDoc } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa";

function Header({ setSearchVal }) {
  const dispatch = useDispatch();
  const selectUser = useSelector((state) => state.userReducer.user);
  const selector = useSelector((state) => state.themeReducer.theme);
  const [themeIcon, setThemeIcon] = useState(!selector);
  const [userDropdown, setuserDropdown] = useState(false);

  const toggleTheme = useCallback(() => {
    dispatch(isTheme({ flag: !selector }));
    localStorage.setItem("isTheme", !selector);
    setThemeIcon(selector);
  });

  const userDrop = useCallback(() => {
    setuserDropdown(!userDropdown);
  });

  const logoutUser = useCallback(() => {
    signOut(auth)
      .then(async () => {
        const offline = doc(db, "users", selectUser.uid);
        try {
          await updateDoc(offline, { useronoff: false });
        } catch (error) {}
      })
      .catch((error) => {
        showSwal(error);
      });
  });
  return (
    <div>
      {/*Header*/}
      <div className="chat-app-header">
        {/*Logo*/}
        <Link to={"/"}>
          <div className="logo">
            <img src={selector ? Logo : LogoLight} alt="" />
          </div>
        </Link>
        {/*Search*/}
        <div className="search-bar">
          <div className="field">
            <div className="control has-icon">
              <input
                type="text"
                className="input search-input"
                placeholder="Search..."
                onChange={(e) => {
                  setSearchVal(e.target.value);
                }}
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
                  className="feather feather-search"
                >
                  <circle cx={11} cy={11} r={8} />
                  <line x1={21} y1={21} x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="search-results has-slimscroll" />
            </div>
          </div>
        </div>
        {/*User Settings*/}
        <div className="user-settings">
          {/*Toolbar*/}
          <div className="toolbar ml-auto">
            <div className="toolbar-link">
              <label className="dark-mode ml-auto">
                <input
                  type="checkbox"
                  checked={themeIcon}
                  onChange={() => {
                    toggleTheme();
                  }}
                />
                <span />
              </label>
            </div>
          </div>
          {/*User Menu*/}
          <div
            className={`dropdown is-right dropdown-trigger user-dropdown ${
              userDropdown && "is-active"
            }`}
            onClick={userDrop}
          >
            <div className="is-trigger" aria-haspopup="true">
              <div className="profile-avatar">
                {selectUser.photoURL ? (
                  <img
                    className="avatar"
                    src={selectUser.photoURL}
                    alt={selectUser.name.toLowerCase()}
                  />
                ) : (
                  <FaUserCircle className="avatar" />
                )}
              </div>
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
                className="feather feather-chevron-down"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div className="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <div className="dropdown-item">
                  <p className="is-size-7">{selectUser.name}</p>
                </div>

                <Link to={"/profile"} className="dropdown-item">
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
                  <span>Edit Profile</span>
                </Link>

                <hr className="dropdown-divider" />
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    logoutUser();
                  }}
                  className="dropdown-item"
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
                    className="feather feather-log-out"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1={21} y1={12} x2={9} y2={12} />
                  </svg>
                  <span>Sign Out</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Header);
