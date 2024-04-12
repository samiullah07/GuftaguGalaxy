import "./App.css";
import { React, useEffect } from "react";
import Routes from "./config/Routes/Routes";
import { useSelector } from "react-redux";


function App() {
  const selector = useSelector((state) => state.themeReducer.theme);
  useEffect(() => {
    const darkModeClass = "is-dark";
    if (selector) {
      document.body.classList.remove(darkModeClass);
    } else {
      document.body.classList.add(darkModeClass);
    }
  }, [selector]);

  return (
    <div id="huro-app" className="app-wrapper">
      <div className="minimal-wrapper darker ">
        <Routes />
      </div>
    </div>
  );
}

export default App;
