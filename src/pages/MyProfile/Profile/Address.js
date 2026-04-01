// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Address = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     addressLine: "",
//     street: "",
//     area: "",
//     city: "",
//     zone: "",
//     country: "India",
//     pincode: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("Address Saved:", form);

//     // 👉 NEXT PAGE
//     navigate("/my-profile/restuarent/bank");
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Address Information</h3>

//       <form onSubmit={handleSubmit} className="profile-form">

//         {/* ROW 1 */}
//         <div className="form-row three-col">
//           <div className="form-group">
//             <label>Address Line</label>
//             <input
//               type="text"
//               name="addressLine"
//               value={form.addressLine}
//               onChange={handleChange}
//               placeholder="Building / Street name"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Street</label>
//             <input
//               type="text"
//               name="street"
//               value={form.street}
//               onChange={handleChange}
//               placeholder="Street / Road"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Area</label>
//             <input
//               type="text"
//               name="area"
//               value={form.area}
//               onChange={handleChange}
//               placeholder="Area / Locality"
//               required
//             />
//           </div>
//         </div>

//         {/* ROW 2 */}
//         <div className="form-row three-col">
//           <div className="form-group">
//             <label>City</label>
//             <input
//               type="text"
//               name="city"
//               value={form.city}
//               onChange={handleChange}
//               placeholder="City"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Zone</label>
//             <select
//               name="zone"
//               value={form.zone}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Zone</option>
//               <option value="Central">Central</option>
//               <option value="North">North</option>
//               <option value="South">South</option>
//               <option value="East">East</option>
//               <option value="West">West</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Country</label>
//             <input type="text" value="India" disabled />
//           </div>
//         </div>

//         {/* ROW 3 */}
//         <div className="form-row three-col">
//           <div className="form-group">
//             <label>Pincode</label>
//             <input
//               type="text"
//               name="pincode"
//               value={form.pincode}
//               onChange={handleChange}
//               placeholder="Postal code"
//               required
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

// export default Address;

import React, { useEffect } from "react";

const API_PROFILE = "http://127.0.0.1:5000/api/profile";

export default function Address({
  form = {},
  setForm = () => {},
  handleChange = () => () => {},
  masterData = {
    street: [],
    zone: [],
    area: [],
    city: [],
    country: []
  },
  setMasterData = () => {},
  roleLower,
  id,
  ro = {}
}) {

  /* ---------------- FETCH ADDRESS ---------------- */

  useEffect(() => {
    if (!roleLower || !id) return;

    const loadAddress = async () => {
      try {
        const res = await fetch(
          `${API_PROFILE}/${roleLower}/address/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (!res.ok) {
          console.error("Address API failed");
          return;
        }

        const json = await res.json();

        if (!json?.status) return;

        setForm((prev) => ({
          ...prev,
          address: prev.address || json.address || "",
          street: prev.street || json.street || "",
          zone: prev.zone || json.zone || "",
          area: prev.area || json.area || "",
          city: prev.city || json.city || "",
          country: prev.country || json.country || ""
        }));

      } catch (err) {
        console.error("Address fetch error:", err);
      }
    };

    loadAddress();

  }, [roleLower, id, setForm]);



  /* ---------------- LOAD MASTER DROPDOWNS ---------------- */

  useEffect(() => {

    const fetchMaster = async (category) => {
      try {

        const res = await fetch(
          `${API_PROFILE}/master/${category}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (!res.ok) return [];

        const json = await res.json();

        return json?.data || [];

      } catch (err) {
        console.error(`Master ${category} error:`, err);
        return [];
      }
    };

    const loadMasters = async () => {

      const street = await fetchMaster("street");
      const zone = await fetchMaster("zone");
      const area = await fetchMaster("area");
      const city = await fetchMaster("city");
      const country = await fetchMaster("country");

      setMasterData({
        street,
        zone,
        area,
        city,
        country
      });

    };

    loadMasters();

  }, [setMasterData]);



  return (
    <div className="profile-card">

      <h3 className="profile-title">Address Information</h3>

      <form className="profile-form">

        {/* ROW 1 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>Address</label>
            <input
              value={form?.address || ""}
              onChange={handleChange("address")}
              {...ro}
            />
          </div>


          <div className="form-group">
            <label>Street</label>

            <select
              value={form?.street || ""}
              onChange={handleChange("street")}
              {...ro}
            >
              <option value="">-- Select --</option>

              {(masterData?.street || []).map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}

            </select>
          </div>


          <div className="form-group">
            <label>Zone</label>

            <select
              value={form?.zone || ""}
              onChange={handleChange("zone")}
              {...ro}
            >
              <option value="">-- Select --</option>

              {(masterData?.zone || []).map((z, i) => (
                <option key={i} value={z}>
                  {z}
                </option>
              ))}

            </select>
          </div>

        </div>



        {/* ROW 2 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>Area</label>

            <select
              value={form?.area || ""}
              onChange={handleChange("area")}
              {...ro}
            >
              <option value="">-- Select --</option>

              {(masterData?.area || []).map((a, i) => (
                <option key={i} value={a}>
                  {a}
                </option>
              ))}

            </select>
          </div>


          <div className="form-group">
            <label>City</label>

            <input
              value={form?.city || ""}
              readOnly
              className="readonly-field"
            />
          </div>


          <div className="form-group">
            <label>Country</label>

            <input
              value={form?.country || ""}
              readOnly
              className="readonly-field"
            />
          </div>

        </div>

      </form>

    </div>
  );
}