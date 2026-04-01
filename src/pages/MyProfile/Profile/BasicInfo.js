// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const BasicInfo = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     fullName: "Ahmed Hassan",
//     companyName: "Golden Spoon Restaurant",
//     email: "saisandeepreddyv@gmail.com",
//     phone: "9745551234",
//     profileType: "Restaurant",
//     status: "Saved",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("Basic Info Saved:", form);

//     // 👉 Next step
//     navigate("/my-profile/restuarent/company");
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Basic Info</h3>

//       <form onSubmit={handleSubmit} className="profile-form">

//         {/* ROW 1 */}
//         <div className="form-row  ">
//           <div className="form-group">
//             <label>Full Name</label>
//             <input
//               type="text"
//               name="fullName"
//               value={form.fullName}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Company Name</label>
//             <input
//               type="text"
//               name="companyName"
//               value={form.companyName}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>

//         {/* ROW 2 */}
//         <div className="form-row  ">
          

//           <div className="form-group">
//             <label>Phone</label>
//             <input
//               type="tel"
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               required
//             />
//           </div>
        
//           <div className="form-group">
//             <label>Profile Type</label>
//             <input type="text" value={form.profileType} disabled />
//           </div>

         

//           <div className="form-group">
//             <label>Country</label>
//             <input type="text" value="India" disabled />
//           </div>
//         </div>

//         {/* ACTION */}
//         <div className="form-actions">
//           <button type="submit" className="btn-primary">
//             Save & Next →
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BasicInfo;



import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_PROFILE = "http://127.0.0.1:5000/api/profile";

const BasicInfo = ({ roleLower, id, editMode = true }) => {

  const navigate = useNavigate();

  const ro = editMode ? {} : { readOnly: true, disabled: true };

  const dirtyRef = useRef({});

  const markDirty = (step) => {
    dirtyRef.current[step] = true;
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    profileType: "",
    city: "",
    country: "",
  });

  /* ===== FETCH BASIC INFO ===== */

  useEffect(() => {
    if (!roleLower || !id) return;

    const fetchBasic = async () => {
      try {

        const res = await fetch(
          `${API_PROFILE}/${roleLower}/basic/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const json = await res.json();

        if (!json.status) return;

        setForm({
          fullName: json.fullName || "",
          companyName: json.companyName || "",
          email: json.email || "",
          phone: json.phone || "",
          profileType: roleLower || "",
          city: json.city || "",
          country: json.country || "",
        });

      } catch (err) {
        console.error("Basic info fetch failed", err);
      }
    };

    fetchBasic();

  }, [roleLower, id]);

  /* ===== HANDLE CHANGE ===== */

  const handleChange = (field) => (e) => {

    const value = e?.target?.value ?? e;

    markDirty("basic");

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ===== SUBMIT ===== */

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Basic Info Saved:", form);
    console.log("Dirty Status:", dirtyRef.current);

    navigate("/my-profile/restuarent/company");
  };

  return (
    <div className="profile-card">
      <h3 className="profile-title">Basic Info</h3>

      <form onSubmit={handleSubmit} className="profile-form">

        {/* ROW 1 */}
        <div className="form-row">

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              readOnly
              className="readonly-field"
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={form.companyName}
              onChange={handleChange("companyName")}
              readOnly
              className="readonly-field"
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              readOnly
              className="readonly-field"
              {...ro}
            />
          </div>

        </div>

        {/* ROW 2 */}
        <div className="form-row">

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              readOnly
              className="readonly-field"
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Profile Type</label>
            <input
              value={capitalize(form.profileType)}
              readOnly
              className="readonly-field"
            />
          </div>

        </div>

        {/* ACTION */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save & Next →
          </button>
        </div>

      </form>
    </div>
  );
};

export default BasicInfo;