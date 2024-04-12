import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";

function Users({
  name,
  img,
  id,
  showChat,
  isActive,
  isOnline,
  notifications,
  setIsArea,
}) {
  return (
    <>
      {/*Conversation*/}
      <div
        className={`conversation ${isActive === id && "active"}`}
        onClick={() => {
          setIsArea(false);
          showChat(id);
        }}
      >
        <div className="h-avatar">
          {img ? (
            <img className="avatar" src={img} alt={name.toLowerCase()} />
          ) : (
            <FaUserCircle className="avatar" />
          )}
        </div>
        <div className="conversation-detail">
          <div className="conversation-username text-cap">
            {name.toLowerCase()}
          </div>
          <div className="conversation-content">
            {isOnline ? (
              <div className="conversation-message text-center d-flex align-item">
                <GoDotFill style={{ color: "green" }} /> Online
              </div>
            ) : (
              <div className="conversation-message text-center d-flex align-item">
                <GoDotFill style={{ color: "red" }} /> Offline
              </div>
            )}
            {notifications && (
              <span>
                <div className="notificationsBox">{notifications}</div>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Users;
