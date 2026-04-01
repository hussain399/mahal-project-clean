// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API = "http://127.0.0.1:5000/api/v1";

// export default function GRNList() {
//   const [grns, setGrns] = useState([]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetch(`${API}/grn`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setGrns);
//   }, [token]);

//   return (
//     <div className="orders-page">
//       <h2 className="page-title">Goods Receipt Notes</h2>

//       <table className="orders-table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>GRN No</th>
//             <th>Supplier</th>
//             <th>Order</th>
//             <th>Status</th>
//             <th />
//           </tr>
//         </thead>
//         <tbody>
//           {grns.map((g, i) => (
//             <tr key={g.grn_id}>
//               <td>{i + 1}</td>
//               <td>GRN-{String(g.grn_id).padStart(5, "0")}</td>
//               <td>{g.supplier_name}</td>
//               <td>{g.order_id}</td>
//               <td>{g.status}</td>
//               <td>
//                 <button
//                   onClick={() =>
//                     navigate(`/restaurantdashboard/grn/${g.order_id}`)
//                   }
//                 >
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {grns.length === 0 && (
//             <tr>
//               <td colSpan="6" align="center">No GRNs found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }







import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/v1";

export default function GRNList() {
  const [grns, setGrns] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/grn`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setGrns(Array.isArray(data) ? data : []));
  }, [token]);

  return (
    <div className="orders_page">
      <h3 className="page_title">Goods Receipt Notes</h3>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>GRN No</th>
              <th>Supplier</th>
              <th>Order</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {grns.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  No GRNs found
                </td>
              </tr>
            )}

            {grns.map((g, i) => (
              <tr key={g.grn_id}>
                <td>{i + 1}</td>
                <td>GRN-{String(g.grn_id).padStart(5, "0")}</td>
                <td>{g.supplier_name}</td>
                <td>{g.order_id}</td>
                <td>
                  <span className={`status ${g.status}`}>
                    {g.status}
                  </span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() =>
                      navigate(`/restaurantdashboard/grn/${g.order_id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

