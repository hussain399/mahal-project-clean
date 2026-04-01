import React from "react";
import { Outlet } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import "../../../styles/Profile.css";


const MyProfileLayout = () => {
  return (
    <div className="profile-layout">
      <ProfileSidebar />
      <main className="profile-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MyProfileLayout;
