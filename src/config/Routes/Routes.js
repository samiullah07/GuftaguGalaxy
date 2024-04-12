import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "../../pages/Chat";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFound from "../../components/NotFound";
import Profile from "../../pages/Profile";

function MyRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoutes component={<Chat />} />} />
        <Route
          path="/profile"
          element={<ProtectedRoutes component={<Profile />} />}
        />
        <Route
          path="/chat"
          element={<ProtectedRoutes component={<Chat />} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default MyRoutes;
