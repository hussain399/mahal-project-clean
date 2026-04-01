import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const emptyBranch = {
  branchNameEn: "",
  branchNameAr: "",
  branchManager: "",
  contactNumber: "",
  email: "",
  street: "",
  zone: "",
  building: "",
  officeNo: "",
  city: "",
  country: "India",
  branchLicense: "",
};

const Branches = ({ editMode = true }) => {

  const navigate = useNavigate();

  const ro = editMode ? {} : { readOnly: true, disabled: true };

  const dirtyRef = useRef({});

  const markDirty = () => {
    dirtyRef.current.branch = true;
  };

  const [multiBranch, setMultiBranch] = useState("No");
  const [totalBranches, setTotalBranches] = useState(1);
  const [branchCount, setBranchCount] = useState(1);
  const [branches, setBranches] = useState([{ ...emptyBranch }]);

  const currentBranch = branches[branchCount - 1];

  /* GENERATE BRANCHES */
  const updateBranchCount = (count) => {

    const safeCount = Math.max(1, count);

    const updated = [...branches];

    while (updated.length < safeCount) {
      updated.push({ ...emptyBranch });
    }

    updated.length = safeCount;

    setBranches(updated);
    setTotalBranches(safeCount);
    setBranchCount(1);
  };

  const handleBranchChange = (index, key, value) => {

    markDirty();

    setBranches((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  /* FAKE TRANSLATION (replace later with API) */
  const translateToArabic = async (text) => {
    return text + " (AR)";
  };

  const handleSaveNext = (e) => {

    e.preventDefault();

    if (branchCount < totalBranches) {
      setBranchCount((c) => c + 1);
    } else {
      console.log("All Branches:", branches);
      navigate("/my-profile/Profile/settings");
    }
  };

  const handleBranchBackStep = () => {
    if (branchCount > 1) {
      setBranchCount((c) => c - 1);
    }
  };

  return (
    <div className="profile-card">

      <h3 className="profile-title">Restaurant Branch Registration</h3>

      {/* ===== MULTI BRANCH TOGGLE ===== */}
      <div className="form-row">

        <div className="form-group">
          <label>Multiple Branches?</label>

          <select
            value={multiBranch}
            onChange={(e) => {
              const val = e.target.value;
              setMultiBranch(val);

              if (val === "No") {
                updateBranchCount(1);
              }
            }}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

        </div>

        {multiBranch === "Yes" && (
          <div className="form-group">

            <label>Total Branches</label>

            <input
              type="number"
              min="1"
              value={totalBranches}
              onChange={(e) =>
                updateBranchCount(parseInt(e.target.value, 10) || 1)
              }
            />

          </div>
        )}

      </div>

      {/* ===== BRANCH PROGRESS ===== */}
      <div className="branch-progress">
        Branch {branchCount} of {totalBranches}
      </div>


      {/* ===== FORM ===== */}
      <form className="profile-form" onSubmit={handleSaveNext}>

        {/* ROW 1 */}
        <div className="form-row">

          <div className="form-group">
            <label>Branch Name (EN)</label>
            <input
              value={currentBranch.branchNameEn}
              onChange={async (e) => {

                const val = e.target.value;

                handleBranchChange(branchCount - 1, "branchNameEn", val);

                if (val.trim()) {
                  const ar = await translateToArabic(val);
                  handleBranchChange(branchCount - 1, "branchNameAr", ar);
                }

              }}
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Branch Name (AR)</label>
            <input
              value={currentBranch.branchNameAr}
              dir="rtl"
              readOnly
              className="readonly-field"
            />
          </div>

          <div className="form-group">
            <label>Branch Manager</label>
            <input
              value={currentBranch.branchManager}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "branchManager", e.target.value)
              }
              {...ro}
            />
          </div>

        </div>


        {/* ROW 2 */}
        <div className="form-row">

          <div className="form-group">
            <label>Contact</label>
            <input
              value={currentBranch.contactNumber}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "contactNumber", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              value={currentBranch.email}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "email", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Street</label>
            <input
              value={currentBranch.street}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "street", e.target.value)
              }
              {...ro}
            />
          </div>

        </div>


        {/* ROW 3 */}
        <div className="form-row">

          <div className="form-group">
            <label>Zone</label>
            <input
              value={currentBranch.zone}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "zone", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Building</label>
            <input
              value={currentBranch.building}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "building", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Office No</label>
            <input
              value={currentBranch.officeNo}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "officeNo", e.target.value)
              }
              {...ro}
            />
          </div>

        </div>


        {/* ROW 4 */}
        <div className="form-row">

          <div className="form-group">
            <label>City</label>
            <input
              value={currentBranch.city}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "city", e.target.value)
              }
              {...ro}
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input value="India" disabled />
          </div>

          <div className="form-group">
            <label>Branch License</label>
            <input
              value={currentBranch.branchLicense}
              onChange={(e) =>
                handleBranchChange(branchCount - 1, "branchLicense", e.target.value)
              }
              {...ro}
            />
          </div>

        </div>


        {/* ===== ACTIONS ===== */}
        <div className="form-actions">

          {branchCount > 1 && (
            <button
              type="button"
              className="btn-secondary btn"
              onClick={handleBranchBackStep}
            >
              Previous Branch
            </button>
          )}

          <button type="submit" className="btn-primary">
            {branchCount < totalBranches ? "Save & Next Branch →" : "Finish →"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default Branches;

// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// const emptyBranch = {
//   branchNameEn: "",
//   branchNameAr: "",
//   branchManager: "",
//   contactNumber: "",
//   email: "",
//   street: "",
//   zone: "",
//   building: "",
//   officeNo: "",
//   city: "",
//   country: "India",
//   branchLicense: "",
// };

// const Branches = ({ editMode = true }) => {
//   const navigate = useNavigate();

//   const ro = editMode ? {} : { readOnly: true, disabled: true };

//   const dirtyRef = useRef({});

//   const markDirty = () => {
//     dirtyRef.current.branch = true;
//   };

//   const [multiBranch, setMultiBranch] = useState("No");
//   const [totalBranches, setTotalBranches] = useState(1);
//   const [branchCount, setBranchCount] = useState(1);
//   const [branches, setBranches] = useState([{ ...emptyBranch }]);

//   const currentBranch = branches[branchCount - 1];

//   /* GENERATE BRANCHES */
//   const updateBranchCount = (count) => {
//     const safeCount = Math.max(1, count);

//     const updated = [...branches];

//     while (updated.length < safeCount) {
//       updated.push({ ...emptyBranch });
//     }

//     updated.length = safeCount;

//     setBranches(updated);
//     setTotalBranches(safeCount);
//     setBranchCount(1);
//   };

//   const handleBranchChange = (index, key, value) => {
//     markDirty();

//     setBranches((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [key]: value };
//       return updated;
//     });
//   };

//   /* FAKE TRANSLATION (replace with API if needed) */
//   const translateToArabic = async (text) => {
//     return text + " (AR)";
//   };

//   const handleSaveNext = () => {
//     if (branchCount < totalBranches) {
//       setBranchCount((c) => c + 1);
//     } else {
//       console.log("All Branches:", branches);
//       navigate("/my-profile/restuarent/settings");
//     }
//   };

//   const handleBranchBackStep = () => {
//     if (branchCount > 1) {
//       setBranchCount((c) => c - 1);
//     }
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Restaurant Branch Registration</h3>

//       {/* TOGGLES */}
//       <div className="form-row">
//         <div className="toggle-group">
//           <label>
//             <input
//               type="radio"
//               value="No"
//               checked={multiBranch === "No"}
//               onChange={() => {
//                 setMultiBranch("No");
//                 updateBranchCount(1);
//               }}
//               {...ro}
//             />
//             No
//           </label>

//           <label>
//             <input
//               type="radio"
//               value="Yes"
//               checked={multiBranch === "Yes"}
//               onChange={() => setMultiBranch("Yes")}
//               {...ro}
//             />
//             Yes
//           </label>
//         </div>

//         <div className="form-group">
//           <label>Total Branches</label>

//           <input
//             type="number"
//             min="1"
//             value={totalBranches}
//             onChange={(e) => updateBranchCount(Number(e.target.value))}
//             {...ro}
//           />
//         </div>

//         <div className="form-group">
//           <label>Status</label>
//           <input value="Active" disabled />
//         </div>
//       </div>

//       {/* BRANCH TABS */}
//       {branches.length > 1 && (
//         <div className="branch-tabs">
//           {branches.map((_, i) => (
//             <button
//               key={i}
//               type="button"
//               className={i === branchCount - 1 ? "tab active" : "tab"}
//               onClick={() => setBranchCount(i + 1)}
//             >
//               Branch {i + 1}
//             </button>
//           ))}
//         </div>
//       )}

//       <p className="section-hint">
//         Editing Branch {branchCount} of {branches.length}
//       </p>

//       {/* FORM */}
//       <div className="profile-form">

//         {/* ROW 1 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>Branch Name (EN)</label>

//             <input
//               value={currentBranch.branchNameEn}
//               onChange={async (e) => {
//                 const en = e.target.value;

//                 handleBranchChange(branchCount - 1, "branchNameEn", en);

//                 if (en.trim()) {
//                   const ar = await translateToArabic(en);
//                   handleBranchChange(branchCount - 1, "branchNameAr", ar);
//                 } else {
//                   handleBranchChange(branchCount - 1, "branchNameAr", "");
//                 }
//               }}
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Branch Name (AR)</label>

//             <input
//               value={currentBranch.branchNameAr}
//               readOnly
//               className="readonly-field"
//               dir="rtl"
//             />
//           </div>

//           <div className="form-group">
//             <label>Branch Manager</label>

//             <input
//               value={currentBranch.branchManager}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "branchManager",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>
//         </div>

//         {/* ROW 2 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>Contact</label>

//             <input
//               value={currentBranch.contactNumber}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "contactNumber",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Email</label>

//             <input
//               value={currentBranch.email}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "email",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Street</label>

//             <input
//               value={currentBranch.street}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "street",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>
//         </div>

//         {/* ROW 3 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>Zone</label>

//             <input
//               value={currentBranch.zone}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "zone",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Building</label>

//             <input
//               value={currentBranch.building}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "building",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Office No</label>

//             <input
//               value={currentBranch.officeNo}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "officeNo",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>
//         </div>

//         {/* ROW 4 */}
//         <div className="form-row">
//           <div className="form-group">
//             <label>City</label>

//             <input
//               value={currentBranch.city}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "city",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Country</label>

//             <input
//               value={currentBranch.country}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "country",
//                   e.target.value
//                 )
//               }
//               {...ro}
//             />
//           </div>

//           <div className="form-group">
//             <label>Branch License</label>

//             <input
//               value={currentBranch.branchLicense}
//               onChange={(e) =>
//                 handleBranchChange(
//                   branchCount - 1,
//                   "branchLicense",
//                   e.target.value.toUpperCase()
//                 )
//               }
//               {...ro}
//             />

//             <small className="hint">
//               Issued by authority for this branch
//             </small>
//           </div>
//         </div>

//         {editMode && (
//           <div className="button-row">
//             {branchCount > 1 && (
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={handleBranchBackStep}
//               >
//                 Previous Branch
//               </button>
//             )}

//             <button
//               type="button"
//               className="btn btn-primary"
//               onClick={handleSaveNext}
//             >
//               {branchCount < totalBranches
//                 ? "Save & Next Branch"
//                 : "Finish Branches"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Branches;