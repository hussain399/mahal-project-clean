// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const CompanyInfo = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     companyName: "Golden Spoon Restaurant",
//     email: "",
//     crNumber: "1234567890",
//     crExpiry: "2027-05-31",
//     computerCardNumber: "CC-998877",
//     computerCardExpiry: "2026-12-31",
//     signingAuthority: "Mohammed Ali",
//     sponsorName: "Qatar Trading WLL",
//     tradeLicense: "TL-554433",
//     vatNumber: "9876543210",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Restaurant Info Saved:", form);
//     navigate("/my-profile/restuarent/address");
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Restaurant Info</h3>

//       <form onSubmit={handleSubmit} className="profile-form">

//         {/* ROW 1 */}
//         <div className="form-row three-col">

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
//               placeholder="Company email"
//             />
//           </div>

//            <div className="form-group">
//             <label>CR Number</label>
//             <input
//               type="text"
//               name="crNumber"
//               value={form.crNumber}
//               onChange={handleChange}
//             />
//             <small>Digits only (6–10 numbers)</small>
//           </div>

//         </div>

//         {/* ROW 2 */}
//         <div className="form-row three-col">

//           <div className="form-group">
//             <label>CR Expiry</label>
//             <input
//               type="date"
//               name="crExpiry"
//               value={form.crExpiry}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label>Computer Card Number</label>
//             <input
//               type="text"
//               name="computerCardNumber"
//               value={form.computerCardNumber}
//               onChange={handleChange}
//             />
//             <small>Digits only (7–12 numbers)</small>
//           </div>

//           <div className="form-group">
//             <label>Computer Card Expiry</label>
//             <input
//               type="date"
//               name="computerCardExpiry"
//               value={form.computerCardExpiry}
//               onChange={handleChange}
//             />
//           </div>

//         </div>

//         {/* ROW 4 */}
//         <div className="form-row three-col">

//           <div className="form-group">
//             <label>Signing Authority</label>
//             <input
//               type="text"
//               name="signingAuthority"
//               value={form.signingAuthority}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label>Sponsor Name</label>
//             <input
//               type="text"
//               name="sponsorName"
//               value={form.sponsorName}
//               onChange={handleChange}
//             />
//           </div>

//             <div className="form-group">
//             <label>Trade License Name</label>
//             <input
//               type="text"
//               name="tradeLicense"
//               value={form.tradeLicense}
//               onChange={handleChange}
//             />
//             <small>Must match trade license exactly</small>
//           </div>

//         </div>

//         {/* ROW 5 */}
//         <div className="form-row three-col">

        

//           <div className="form-group">
//             <label>VAT Number</label>
//             <input
//               type="text"
//               name="vatNumber"
//               value={form.vatNumber}
//               onChange={handleChange}
//             />
//             <small>15-digit VAT number</small>
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

// export default CompanyInfo;

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/profile";

const CompanyInfo = ({ editMode = true, role = "restaurant" }) => {

  const navigate = useNavigate();

  const ro = editMode ? {} : { readOnly: true, disabled: true };

  const dirtyRef = useRef({});

  const markDirty = (step) => {
    dirtyRef.current[step] = true;
  };

  const restaurantId = localStorage.getItem("restaurant_id");

  const [form, setForm] = useState({
    companyName: "",
    org_companyEmail: "",
    crNumber: "",
    crExpiry: "",
    compCardNumber: "",
    compCardExpiry: "",
    signingAuthority: "",
    sponsorName: "",
    tradeLicenseName: "",
    vatNumber: "",
  });

  const handleChange = (field) => (e) => {

    const value = e?.target?.value ?? e;

    markDirty("org");

    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };


  /* ================= LOAD DATA ================= */

  useEffect(() => {

    if (!restaurantId) return;

    const loadData = async () => {

      try {

        const res = await fetch(
          `${API}/restaurant/org/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const json = await res.json();

        if (!json.status) return;

        const d = json.data || {};

        setForm((prev) => ({
          ...prev,
          org_companyEmail: d.company_email || "",
          crNumber: d.cr_number || "",
          crExpiry: d.cr_expiry_date || "",
          compCardNumber: d.computer_card_number || "",
          compCardExpiry: d.computer_card_expiry_date || "",
          signingAuthority: d.signing_authority_name || "",
          sponsorName: d.sponsor_name || "",
          tradeLicenseName: d.trade_license_name || "",
          vatNumber: d.vat_tax_number || ""
        }));

      } catch (err) {
        console.error("Org fetch error:", err);
      }

    };

    loadData();

  }, [restaurantId]);


  /* ================= SAVE ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await fetch(
        `${API}/restaurant/update/org/${restaurantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(form)
        }
      );

      console.log("Restaurant Info Saved:", form);

      navigate("/my-profile/Profile/address");

    } catch (err) {

      console.error("Save error:", err);

    }

  };


  return (
    <div className="profile-card">

      <h3 className="profile-title">Restaurant Info</h3>

      <form onSubmit={handleSubmit} className="profile-form">


        {/* ROW 1 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>Company Name</label>

            <input
              type="text"
              value={form.companyName}
              readOnly
              className="readonly-field"
            />

          </div>


          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={form.org_companyEmail}
              readOnly
              className="readonly-field"
              placeholder="Company email"
              {...ro}
            />

          </div>


          <div className="form-group">
            <label>CR Number</label>

            <input
              type="text"
              value={form.crNumber}
              onChange={(e) => {

                const v = e.target.value.replace(/\D/g, "");

                handleChange("crNumber")({ target: { value: v } });

              }}
              maxLength={10}
              {...ro}
            />

            <small>Digits only (6–10 numbers)</small>

          </div>

        </div>


        {/* ROW 2 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>CR Expiry</label>

            <input
              type="date"
              value={form.crExpiry}
              onChange={handleChange("crExpiry")}
              {...ro}
            />

          </div>


          <div className="form-group">
            <label>Computer Card Number</label>

            <input
              type="text"
              value={form.compCardNumber}
              onChange={(e) => {

                const v = e.target.value.replace(/\D/g, "");

                handleChange("compCardNumber")({ target: { value: v } });

              }}
              maxLength={12}
              {...ro}
            />

            <small>Digits only (7–12 numbers)</small>

          </div>


          <div className="form-group">
            <label>Computer Card Expiry</label>

            <input
              type="date"
              value={form.compCardExpiry}
              onChange={handleChange("compCardExpiry")}
              {...ro}
            />

          </div>

        </div>


        {/* ROW 3 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>Signing Authority</label>

            <input
              type="text"
              value={form.signingAuthority}
              onChange={handleChange("signingAuthority")}
              {...ro}
            />

          </div>


          <div className="form-group">
            <label>Sponsor Name</label>

            <input
              type="text"
              value={form.sponsorName}
              onChange={handleChange("sponsorName")}
              {...ro}
            />

          </div>


          <div className="form-group">
            <label>Trade License Name</label>

            <input
              type="text"
              value={form.tradeLicenseName}
              onChange={handleChange("tradeLicenseName")}
              {...ro}
            />

            <small>Must match trade license exactly</small>

          </div>

        </div>


        {/* ROW 4 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>VAT Number</label>

            <input
              type="text"
              value={form.vatNumber}
              onChange={(e) => {

                const v = e.target.value.replace(/\D/g, "");

                handleChange("vatNumber")({ target: { value: v } });

              }}
              maxLength={15}
              {...ro}
            />

            <small>15-digit VAT number</small>

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

export default CompanyInfo;