import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/img/logos/logo/logo.svg";
import LogoLight from "../../assets/img/logos/logo/logo-light.svg";
import { useDispatch, useSelector } from "react-redux";
import { isTheme } from "../../config/Redux/Reducers/ThemeSlice";

function AuthHeader() {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state.themeReducer.theme);
  const [themeIcon, setThemeIcon] = useState(!selector);

  const toggleTheme = useCallback(() => {
    dispatch(isTheme({ flag: !selector }));
    localStorage.setItem("isTheme", !selector);
    setThemeIcon(selector);
  });
  return (
    <>
      <div className="auth-nav">
        <div className="left" />
        <div className="center">
          <Link to="/" className="header-item">
            <img src={selector ? Logo : LogoLight} alt="" />
          </Link>
        </div>
        <div className="right">
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
    </>
  );
}

export default AuthHeader;
