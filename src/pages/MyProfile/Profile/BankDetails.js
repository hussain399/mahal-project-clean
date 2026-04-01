// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const BankDetails = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     bankName: "",
//     accountHolder: "",
//     accountNumber: "",
//     iban: "",
//     branch: "",
//     swiftCode: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("Bank Details Saved:", form);

//     // 👉 NEXT PAGE
//     navigate("/my-profile/restuarent/documents");
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Bank Details</h3>

//       <form onSubmit={handleSubmit} className="profile-form">

//         {/* ROW 1 */}
//         <div className="form-row three-col">
//           <div className="form-group">
//             <label>Bank Name</label>
//             <input
//               type="text"
//               name="bankName"
//               value={form.bankName}
//               onChange={handleChange}
//               placeholder="e.g. HDFC Bank"
//               required
//             />
            
//           </div>

//           <div className="form-group">
//             <label>Account Holder Name</label>
//             <input
//               type="text"
//               name="accountHolder"
//               value={form.accountHolder}
//               onChange={handleChange}
//               placeholder="As per bank records"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Account Number</label>
//             <input
//               type="text"
//               name="accountNumber"
//               value={form.accountNumber}
//               onChange={handleChange}
//               placeholder="Account number"
//               required
//             />
//           </div>
//         </div>

//         {/* ROW 2 */}
//         <div className="form-row three-col">
//           <div className="form-group">
//             <label>IBAN</label>
//             <input
//               type="text"
//               name="iban"
//               value={form.iban}
//               onChange={handleChange}
//               placeholder="Country code + number"
//             />
//             <small className="hint-text">
//               Required for international payments
//             </small>
//           </div>

//           <div className="form-group">
//             <label>Branch</label>
//             <input
//               type="text"
//               name="branch"
//               value={form.branch}
//               onChange={handleChange}
//               placeholder="Branch name"
//             />
//           </div>

//           <div className="form-group">
//             <label>SWIFT Code</label>
//             <input
//               type="text"
//               name="swiftCode"
//               value={form.swiftCode}
//               onChange={handleChange}
//               placeholder="8 or 11 characters"
//             />
//             <small className="hint-text">Used for international transfers</small>
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

// export default BankDetails;



import React, { useEffect } from "react";

const API_PROFILE = "http://127.0.0.1:5000/api/profile";

export default function BankDetails({
  form = {},
  setForm = () => {},
  handleChange = () => () => {},
  roleLower,
  id,
  ro = {},
  markDirty = () => {}
}) {

  /* ---------------- FETCH BANK DATA ---------------- */

  useEffect(() => {
    if (!roleLower || !id) return;

    fetch(`${API_PROFILE}/${roleLower}/bank/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {

        if (!json.status || !json.data) return;

        setForm((f) => ({
          ...f,
          bankName: f?.bankName || json.data.bank_name || "",
          accountHolder: f?.accountHolder || json.data.account_holder_name || "",
          iban: f?.iban || json.data.iban || "",
          swiftCode: f?.swiftCode || json.data.swift_code || "",
          branch: f?.branch || json.data.branch || "",
        }));

      })
      .catch((err) => console.error("Bank fetch error:", err));

  }, [roleLower, id, setForm]);



  return (
    <div className="profile-card">

      <h3 className="profile-title">Bank Details</h3>

      <form className="profile-form">

        {/* ROW 1 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>Bank Name</label>
            <input
              value={form?.bankName || ""}
              placeholder="e.g. HDFC Bank"
              onChange={(e) => {
                markDirty("bank");
                handleChange("bankName")(e);
              }}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Account Holder</label>
            <input
              value={form?.accountHolder || ""}
              placeholder="Name as per bank records"
              onChange={(e) => {
                markDirty("bank");
                handleChange("accountHolder")(e);
              }}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Branch</label>
            <input
              value={form?.branch || ""}
              placeholder="Branch name"
              onChange={(e) => {
                markDirty("bank");
                handleChange("branch")(e);
              }}
              {...ro}
            />
          </div>

        </div>



        {/* ROW 2 */}
        <div className="form-row three-col">

          <div className="form-group">
            <label>IBAN</label>
            <input
              value={form?.iban || ""}
              placeholder="Country code + number"
              onChange={(e) => {
                markDirty("bank");

                const v = e.target.value
                  .replace(/\s/g, "")
                  .toUpperCase();

                handleChange("iban")({
                  target: { value: v }
                });
              }}
              maxLength={34}
              {...ro}
            />

            <small className="hint">
              Required for international payments
            </small>
          </div>

          <div className="form-group">
            <label>Swift Code</label>
            <input
              value={form?.swiftCode || ""}
              placeholder="8 or 11 characters"
              onChange={(e) => {

                markDirty("bank");

                const v = e.target.value
                  .replace(/[^A-Za-z0-9]/g, "")
                  .toUpperCase();

                handleChange("swiftCode")({
                  target: { value: v }
                });

              }}
              maxLength={11}
              {...ro}
            />

            <small className="hint">
              Used for international transfers
            </small>
          </div>

        </div>

      </form>

    </div>
  );
}