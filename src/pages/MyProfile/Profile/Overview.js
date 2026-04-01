// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Overview = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="profile-overview-page">

//       {/* ===== HEADER ===== */}
//       <div className="overview-header">
//         <div>
//           <h2>
//             Rakesh Kumar
//             <span className="profile-type">Restuarent Profile</span>
//           </h2>
//           <p className="company-name">Mahal Fresh Foods</p>
//         </div>

//         <span className="verification-chip pending">
//           ⏳ Verification Pending
//         </span>
//       </div>

//       {/* ===== INFO CARDS ===== */}
//       <div className="overview-grid">

//         {/* BASIC INFO */}
//         <div className="overview-card">
//           <div className="card-header">
//             <h4>Basic Info</h4>
//             <button onClick={() => navigate("/my-profile/restuarent/basic")}>
//               ✏️ Edit
//             </button>
//           </div>

//           <p><strong>Name:</strong> Rakesh Kumar</p>
//           <p><strong>Email:</strong> rakesh@gmail.com</p>
//           <p><strong>Phone:</strong> +91 98765 43210</p>
//         </div>

//         {/* COMPANY */}
//         <div className="overview-card">
//           <div className="card-header">
//             <h4>Company</h4>
//             <button onClick={() => navigate("/my-profile/restuarent/company")}>
//               ✏️ Edit
//             </button>
//           </div>

//           <p><strong>Name:</strong> Mahal Fresh Foods</p>
//           <p><strong>Category:</strong> Groceries & Vegetables</p>
//           <p><strong>VAT:</strong> VAT-987654</p>
//         </div>

//         {/* ADDRESS */}
//         <div className="overview-card">
//           <div className="card-header">
//             <h4>Address</h4>
//             <button onClick={() => navigate("/my-profile/restuarent/address")}>
//               ✏️ Edit
//             </button>
//           </div>

//           <p>Hyderabad, Telangana</p>
//           <p>India</p>
//         </div>

//         {/* BANK */}
//         <div className="overview-card">
//           <div className="card-header">
//             <h4>Bank</h4>
//             <button onClick={() => navigate("/my-profile/restuarent/bank")}>
//               ✏️ Edit
//             </button>
//           </div>

//           <p><strong>Bank:</strong> HDFC Bank</p>
//           <p><strong>A/C:</strong> **** **** 2345</p>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Overview;



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/profile";

const Overview = () => {

  const navigate = useNavigate();
  const BASE = "/my-profile/Profile";

  const [basic, setBasic] = useState({});
  const [org, setOrg] = useState({});
  const [address, setAddress] = useState({});
  const [bank, setBank] = useState({});

  const restaurantId = localStorage.getItem("restaurant_id");

  useEffect(() => {

    const loadData = async () => {

      try {

        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [basicRes, orgRes, addrRes, bankRes] = await Promise.all([
          axios.get(`${API}/basic`, { headers }),
          axios.get(`${API}/restaurant/org/${restaurantId}`, { headers }),
          axios.get(`${API}/address`, { headers }),
          axios.get(`${API}/restaurant/bank/${restaurantId}`, { headers })
        ]);

        if (basicRes.data?.status) setBasic(basicRes.data);
        if (orgRes.data?.status) setOrg(orgRes.data.data || {});
        if (addrRes.data?.status) setAddress(addrRes.data);
        if (bankRes.data?.status) setBank(bankRes.data.data || {});

      } catch (err) {
        console.error("Overview load failed", err);
      }

    };

    loadData();

  }, [restaurantId]);

  return (
    <div className="profile-overview-page">

      {/* HEADER */}
      <div className="overview-header">

        <div>

          <h2>
            {basic.fullName || "—"}
            <span className="profile-type">Restaurant Profile</span>
          </h2>

          <p className="company-name">
            {basic.companyName || "—"}
          </p>

        </div>

        <span className="verification-chip pending">
          ⏳ Verification Pending
        </span>

      </div>


      {/* INFO CARDS */}
      <div className="overview-grid">

        {/* BASIC INFO */}
        <div className="overview-card">

          <div className="card-header">
            <h4>Basic Info</h4>

            <button onClick={() => navigate(`${BASE}/basic`)}>
              ✏️ Edit
            </button>

          </div>

          <p><strong>Name:</strong> {basic.fullName || "-"}</p>
          <p><strong>Email:</strong> {basic.email || "-"}</p>
          <p><strong>Phone:</strong> {basic.phone || "-"}</p>

        </div>


        {/* COMPANY */}
        <div className="overview-card">

          <div className="card-header">
            <h4>Company</h4>

            <button onClick={() => navigate(`${BASE}/company`)}>
              ✏️ Edit
            </button>

          </div>

          <p><strong>Name:</strong> {basic.companyName || "-"}</p>
          <p><strong>CR Number:</strong> {org.cr_number || "-"}</p>
          <p><strong>VAT:</strong> {org.vat_tax_number || "-"}</p>

        </div>


        {/* ADDRESS */}
        <div className="overview-card">

          <div className="card-header">
            <h4>Address</h4>

            <button onClick={() => navigate(`${BASE}/address`)}>
              ✏️ Edit
            </button>

          </div>

          <p>{address.address || "-"}</p>
          <p>{address.city || "-"}, {address.country || "-"}</p>

        </div>


        {/* BANK */}
        <div className="overview-card">

          <div className="card-header">
            <h4>Bank</h4>

            <button onClick={() => navigate(`${BASE}/bank`)}>
              ✏️ Edit
            </button>

          </div>

          <p><strong>Bank:</strong> {bank.bank_name || "-"}</p>
          <p>
            <strong>IBAN:</strong>{" "}
            {bank.iban
              ? `**** **** **** ${bank.iban.slice(-4)}`
              : "-"}
          </p>

        </div>

      </div>

    </div>
  );

};

export default Overview;