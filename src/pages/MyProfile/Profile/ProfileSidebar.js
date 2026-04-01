// import React, { useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";

// const links = [
//   { path: "", label: "Overview", icon: "fa-chart-pie" },
//   { path: "basic", label: "Basic Info", icon: "fa-user" },
//   { path: "company", label: "Restaurant Info", icon: "fa-building" },
//   { path: "address", label: "Address", icon: "fa-location-dot" },
//   { path: "bank", label: "Bank Details", icon: "fa-building-columns" },
//   { path: "documents", label: "Documents", icon: "fa-file-lines" },
//   { path: "branches", label: " Restaurant Branch", icon: "fa-code-branch" },
// { path: "store", label: "Restaurant Stores", icon: "fa-solid fa-store" },
//   { path: "settings", label: "Settings", icon: "fa-gear" },
// ];

// const ProfileSidebar = () => {
//   const navigate = useNavigate();

//   // 🔹 states
//   const [showModal, setShowModal] = useState(false);
//   const [profilePic, setProfilePic] = useState(
//     "https://i.pravatar.cc/150?img=12"
//   );

//   const completion = 80;  
//   const isVerified = true;  

//   // 🔹 image upload handler
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfilePic(URL.createObjectURL(file));
//       setShowModal(false);
//     }
//   };

//   return (
//     <>
//       <aside className="profile-sidebar">

         


//         {/* Back */}
//         <button className="back-btn" onClick={() => navigate("/restaurantdashboard")}>
//           <i className="fa-solid fa-arrow-left" />
//           Back to Dashboard
//         </button>

//         {/* Profile Header */}
//         <div className="profile-header">
//           <div
//             className="profile-pic-wrapper"
//             onClick={() => setShowModal(true)}
//           >
//             <img src={profilePic} alt="Supplier" className="profile-pic" />
//             <span className="edit-overlay">
//               <i className="fa-solid fa-camera" />
//             </span>
//           </div>

//           <h4 className="profile-name">ABC Restuarent</h4>
//           <p className="profile-id">Supplier ID: SUP-1024</p>

//           {/* Role Badge */}
//           <span className={`role-badge ${isVerified ? "verified" : "pending"}`}>
//             {isVerified ? "Verified" : "Pending"}
//           </span>

//           {/* Completion */}
//           <div className="progress-wrapper">
//             <div className="progress-label">{completion}% Complete</div>
//             <div className="progress-bar">
//               <div
//                 className="progress-fill"
//                 style={{ width: `${completion}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Nav */}
//         <nav className="sidebar-nav">
//           {links.map((l) => (
//             <NavLink
//               key={l.label}
//               to={l.path}
//               end
//               className={({ isActive }) =>
//                 isActive ? "side-link active" : "side-link"
//               }
//             >
//               <i className={`fa-solid ${l.icon}`} />
//               <span>{l.label}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </aside>

//       {/* 🔹 Upload Modal */}
//       {showModal && (
//         <div className="modal-backdrop">
//           <div className="upload-modal">
//             <h4>Update Profile Picture</h4>

//             <label className="upload-box">
//               <i className="fa-solid fa-cloud-arrow-up" />
//               <span>Click to upload</span>
//               <input type="file" accept="image/*" onChange={handleImageChange} />
//             </label>

//             <button
//               className="cancel-btn"
//               onClick={() => setShowModal(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ProfileSidebar;


import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { path: "", label: "Overview", icon: "fa-chart-pie" },
  { path: "basic", label: "Basic Info", icon: "fa-user" },
  { path: "company", label: "Restaurant Info", icon: "fa-building" },
  { path: "address", label: "Address", icon: "fa-location-dot" },
  { path: "bank", label: "Bank Details", icon: "fa-building-columns" },
  { path: "documents", label: "Documents", icon: "fa-file-lines" },
  { path: "branches", label: "Restaurant Branch", icon: "fa-code-branch" },
  { path: "store", label: "Restaurant Stores", icon: "fa-store" },
  { path: "settings", label: "Settings", icon: "fa-gear" },
];

const ProfileSidebar = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") ||
      "https://i.pravatar.cc/150?img=12"
  );

  const [profileName, setProfileName] = useState("Restaurant");
  const [profileId, setProfileId] = useState("ID-0001");
  const [completion, setCompletion] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  /* 🔥 Load profile info from storage */
  useEffect(() => {
    const name = localStorage.getItem("companyName") || "ABC Restaurant";
    const id = localStorage.getItem("entityId") || "REST-1024";
    const verified = localStorage.getItem("isVerified") === "true";

    setProfileName(name);
    setProfileId(id);
    setIsVerified(verified);

    // 🔥 Example completion logic
    const stepsCompleted =
      JSON.parse(localStorage.getItem("completedSteps")) || [];

    const percent = Math.min(
      Math.round((stepsCompleted.length / links.length) * 100),
      100
    );

    setCompletion(percent);
  }, []);

  /* 🔥 Image Upload */
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
      localStorage.setItem("profilePic", url);
      setShowModal(false);
    }
  };

  return (
    <>
      <aside className="profile-sidebar">

        {/* Back */}
        <button
          className="back-btn"
          onClick={() => navigate("/restaurantdashboard")}
        >
          <i className="fa-solid fa-arrow-left" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="profile-header">
          <div
            className="profile-pic-wrapper"
            onClick={() => setShowModal(true)}
          >
            <img src={profilePic} alt="Restaurant" className="profile-pic" />
            <span className="edit-overlay">
              <i className="fa-solid fa-camera" />
            </span>
          </div>

          <h4 className="profile-name">{profileName}</h4>
          <p className="profile-id">Restaurant ID: {profileId}</p>

          {/* Role Badge */}
          <span
            className={`role-badge ${
              isVerified ? "verified" : "pending"
            }`}
          >
            {isVerified ? "Verified" : "Pending"}
          </span>

          {/* Completion */}
          <div className="progress-wrapper">
            <div className="progress-label">
              {completion}% Complete
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.path}
              end
              className={({ isActive }) =>
                isActive ? "side-link active" : "side-link"
              }
            >
              <i className={`fa-solid ${l.icon}`} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="upload-modal">
            <h4>Update Profile Picture</h4>

            <label className="upload-box">
              <i className="fa-solid fa-cloud-arrow-up" />
              <span>Click to upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            <button
              className="cancel-btn"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSidebar;