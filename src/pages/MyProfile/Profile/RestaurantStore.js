// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const RestaurantStore = () => {
//   const navigate = useNavigate();

//   const [store, setStore] = useState({
//     storeNameAr: "",
//     contactName: "",
//     contactMobile: "",
//     email: "",
//     street: "",
//     zone: "",
//     city: "",
//     country: "India",
//     building: "",
//     shopNo: "",
//     openingTime: "",
//     closingTime: "",
//   });

//   const handleChange = (e) => {
//     setStore({ ...store, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Restaurant Store Saved:", store);

//     // 👉 Next step (example: branches or settings)
//     navigate("/my-profile/restaurant/branches");
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Restaurant Store Details</h3>

//       <form onSubmit={handleSubmit} className="profile-form">

//         {/* ROW 1 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>Store Name (Arabic)</label>
//             <input
//               type="text"
//               name="storeNameAr"
//               value={store.storeNameAr}
//               onChange={handleChange}
//               placeholder="اسم المتجر"
//               dir="rtl"
//             />
//           </div>

//           <div className="form-group">
//             <label>Contact Person Name</label>
//             <input
//               type="text"
//               name="contactName"
//               value={store.contactName}
//               onChange={handleChange}
//               placeholder="Contact person"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Contact Person Mobile</label>
//             <input
//               type="tel"
//               name="contactMobile"
//               value={store.contactMobile}
//               onChange={handleChange}
//               placeholder="Mobile number"
//               required
//             />
//           </div>
//         </div>

//         {/* ROW 2 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={store.email}
//               onChange={handleChange}
//               placeholder="Email address"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Street</label>
//             <input
//               type="text"
//               name="street"
//               value={store.street}
//               onChange={handleChange}
//               placeholder="Street"
//             />
//           </div>

//           <div className="form-group">
//             <label>Zone</label>
//             <input
//               type="text"
//               name="zone"
//               value={store.zone}
//               onChange={handleChange}
//               placeholder="Zone / Area"
//             />
//           </div>
//         </div>

//         {/* ROW 3 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>City</label>
//             <input
//               type="text"
//               name="city"
//               value={store.city}
//               onChange={handleChange}
//               placeholder="City"
//             />
//           </div>

//           <div className="form-group">
//             <label>Country</label>
//             <input type="text" value="India" disabled />
//           </div>

//           <div className="form-group">
//             <label>Building</label>
//             <input
//               type="text"
//               name="building"
//               value={store.building}
//               onChange={handleChange}
//               placeholder="Building name"
//             />
//           </div>
//         </div>

//         {/* ROW 4 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>Shop No.</label>
//             <input
//               type="text"
//               name="shopNo"
//               value={store.shopNo}
//               onChange={handleChange}
//               placeholder="Shop number"
//             />
//           </div>

//           <div className="form-group">
//             <label>Opening Time</label>
//             <input
//               type="time"
//               name="openingTime"
//               value={store.openingTime}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label>Closing Time</label>
//             <input
//               type="time"
//               name="closingTime"
//               value={store.closingTime}
//               onChange={handleChange}
//             />
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

// export default RestaurantStore;



import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/profile";

const RestaurantStore = ({ editMode = true }) => {

  const navigate = useNavigate();

  const ro = editMode ? {} : { readOnly: true, disabled: true };

  const dirtyRef = useRef({});

  const markDirty = (step) => {
    dirtyRef.current[step] = true;
  };

  const [branches, setBranches] = useState([]);

  const [store, setStore] = useState({
    branchName: "",
    storeNameEnglish: "",
    storeNameArabic: "",
    contactPersonName: "",
    contactPersonMobile: "",
    storeEmail: "",
    street: "",
    zone: "",
    city: "",
    country: "India",
    building: "",
    shopNo: "",
    operatingHours: "",
  });

  /* ================= LOAD BRANCH LIST ================= */

  useEffect(() => {

    const loadBranches = async () => {

      try {

        const restaurantId = localStorage.getItem("restaurant_id");

        const res = await axios.get(
          `${API}/restaurant/branch/list/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (res.data.status) {
          setBranches(res.data.branches || []);
        }

      } catch (err) {

        console.error("Branch load failed", err);

      }

    };

    loadBranches();

  }, []);

  /* ================= CHANGE HANDLER ================= */

  const handleStoreChange = (field) => (e) => {

    const value = e?.target?.value ?? e;

    markDirty("store");

    setStore((prev) => ({
      ...prev,
      [field]: value,
    }));

  };

  /* ================= TRANSLATION ================= */

  const translateToArabic = async (text) => {

    try {

      const res = await axios.post(`${API}/translate`, { text });

      return res.data.arabic || "";

    } catch {

      return "";

    }

  };

  /* ================= SAVE STORE ================= */

  const saveStore = async () => {

    try {

      const restaurantId = localStorage.getItem("restaurant_id");

      const restaurantName = localStorage.getItem("restaurant_name");

      await axios.post(
        `${API}/store`,
        {
          restaurant_id: restaurantId,
          restaurantName: restaurantName,
          store: store
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log("✅ Store saved");

      navigate("/my-profile/Profile/settings");

    } catch (err) {

      console.error("❌ Store save failed", err);

      alert("Failed to save store");

    }

  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    await saveStore();

  };

  return (
    <div className="profile-card">

      <h3 className="profile-title">Restaurant Store Details</h3>

      <form onSubmit={handleSubmit} className="profile-form">

        {/* ROW 1 */}
        <div className="form-row">

          <div className="form-group">

            <label>Branch</label>

            <select
              value={store.branchName}
              onChange={handleStoreChange("branchName")}
              required
            >
              <option value="">Select branch</option>

              {branches.map((b, i) => (
                <option key={i} value={b}>
                  {b}
                </option>
              ))}

            </select>

          </div>

          <div className="form-group">

            <label>Store Name (English)</label>

            <input
              value={store.storeNameEnglish}
              {...ro}
              placeholder="Store name"
              onChange={async (e) => {

                const en = e.target.value;

                handleStoreChange("storeNameEnglish")(e);

                if (en.trim()) {

                  const ar = await translateToArabic(en);

                  handleStoreChange("storeNameArabic")({
                    target: { value: ar },
                  });

                } else {

                  handleStoreChange("storeNameArabic")({
                    target: { value: "" },
                  });

                }

              }}
            />

          </div>

          <div className="form-group">

            <label>Store Name (Arabic)</label>

            <input
              value={store.storeNameArabic}
              readOnly
              dir="rtl"
              className="readonly-field"
            />

          </div>

        </div>

        {/* ROW 2 */}
        <div className="form-row">

          <div className="form-group">

            <label>Contact Person Name</label>

            <input
              value={store.contactPersonName}
              onChange={handleStoreChange("contactPersonName")}
              required
              {...ro}
            />

          </div>

          <div className="form-group">

            <label>Contact Person Mobile</label>

            <input
              value={store.contactPersonMobile}
              required
              {...ro}
              onChange={(e) => {

                const cleaned = e.target.value.replace(/\D/g, "");

                handleStoreChange("contactPersonMobile")({
                  target: { value: cleaned }
                });

              }}
            />

          </div>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={store.storeEmail}
              onChange={handleStoreChange("storeEmail")}
              required
              {...ro}
            />

          </div>

        </div>

        {/* ROW 3 */}
        <div className="form-row">

          <div className="form-group">

            <label>Street</label>

            <input
              value={store.street}
              onChange={handleStoreChange("street")}
              {...ro}
            />

          </div>

          <div className="form-group">

            <label>Zone</label>

            <input
              value={store.zone}
              onChange={handleStoreChange("zone")}
              {...ro}
            />

          </div>

          <div className="form-group">

            <label>City</label>

            <input
              value={store.city}
              onChange={handleStoreChange("city")}
              {...ro}
            />

          </div>

        </div>

        {/* ROW 4 */}
        <div className="form-row">

          <div className="form-group">

            <label>Building</label>

            <input
              value={store.building}
              onChange={handleStoreChange("building")}
              {...ro}
            />

          </div>

          <div className="form-group">

            <label>Shop No.</label>

            <input
              value={store.shopNo}
              {...ro}
              onChange={(e) => {

                const cleaned = e.target.value.replace(/\D/g, "");

                handleStoreChange("shopNo")({
                  target: { value: cleaned }
                });

              }}
            />

          </div>

          <div className="form-group">

            <label>Operating Hours</label>

            <input
              value={store.operatingHours}
              onChange={handleStoreChange("operatingHours")}
              placeholder="9:00 AM - 6:00 PM"
              {...ro}
            />

          </div>

        </div>

        {/* ACTIONS */}
        <div className="form-actions">

          <button
            type="button"
            className="btn-secondary btn"
            onClick={() => navigate("/my-profile/Profile/branches")}
          >
            ← Back
          </button>

          <button type="submit" className="btn-primary">
            Save & Next →
          </button>

        </div>

      </form>

    </div>
  );
};

export default RestaurantStore;