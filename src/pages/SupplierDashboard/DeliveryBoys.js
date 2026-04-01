import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:5000/api/v1/delivery-boys";

export default function DeliveryBoys() {
  const [boys, setBoys] = useState([]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  // ✅ Selected Delivery Boy for Update/Delete
  const [selectedBoy, setSelectedBoy] = useState("");

  const token = localStorage.getItem("token");

  // =====================================
  // ✅ Fetch Delivery Boys List
  // =====================================
  const fetchBoys = async () => {
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBoys(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchBoys();
  }, []);

  // =====================================
  // ✅ Add OR Update Delivery Boy
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mobile) {
      alert("⚠️ Name and Mobile are required");
      return;
    }

    try {
      // ✅ If selectedBoy exists → Update
      const url = selectedBoy ? `${API}/${selectedBoy}` : API;
      const method = selectedBoy ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          mobile,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed");
        return;
      }

      alert(
        selectedBoy
          ? "✅ Delivery Boy Updated Successfully"
          : "✅ Delivery Boy Saved Successfully"
      );

      // ✅ Reset Form After Submit/Update
      setName("");
      setMobile("");
      setVehicleType("");
      setVehicleNumber("");
      setSelectedBoy("");

      fetchBoys();
    } catch (err) {
      console.error(err);
      alert("❌ Server Error");
    }
  };

  // =====================================
  // ✅ Delete Delivery Boy
  // =====================================
  const handleDelete = async () => {
    if (!selectedBoy) return;

    if (!window.confirm("Are you sure you want to delete this delivery boy?"))
      return;

    try {
      await fetch(`${API}/${selectedBoy}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("❌ Delivery Boy Deleted Successfully");

      // Reset Fields
      setSelectedBoy("");
      setName("");
      setMobile("");
      setVehicleType("");
      setVehicleNumber("");

      fetchBoys();
    } catch (err) {
      console.error(err);
      alert("❌ Server Error");
    }
  };

  return (
    <div className="dashboard_page add_product_page">
      {/* ✅ HEADER */}
      <div className="page_header glass">
        <div>
          <h2>🚚 Delivery Boys Management</h2>
          <p className="sub_text">Manage delivery staff information</p>
        </div>
      </div>

      {/* ✅ FORM SECTION */}
      <div className="section_card soft">
        <h4>Add / Update Delivery Boy</h4>

        <form onSubmit={handleSubmit}>
          {/* INPUTS */}
          <div className="form_grid three">
            <div className="form_group">
              <label>Driver Name</label>
              <input
                placeholder="Enter Driver Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form_group">
              <label>Mobile Number</label>
              <input
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div className="form_group">
              <label>Vehicle Type</label>
              <input
                placeholder="Bike / Van"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              />
            </div>
          </div>

          <div className="form_grid three">
            <div className="form_group">
              <label>Vehicle Number</label>
              <input
                placeholder="Enter Vehicle Number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
          </div>



          {/* ✅ ACTION BUTTONS */}
          <div className="form_footer">
            {/* Submit / Update Button */}
            <button type="submit" className="btn_save glow">
              {selectedBoy ? "Update Delivery Boy" : "Submit Delivery Boy"}
            </button>

            {/* Delete Button Only If Selected */}
            {selectedBoy && (
              <button
                type="button"
                className="btn_cancel"
                onClick={handleDelete}
              >
                Delete Delivery Boy
              </button>
            )}
          </div>

                    {/* ✅ DROPDOWN BELOW INPUTS */}
          <div className="form_group">
            <label>Select Saved Delivery Boy</label>

            <select
              style={{
    width: "fit-content",
    minWidth: "250px",
  }}
              value={selectedBoy}
              onChange={(e) => {
                const boyId = e.target.value;
                setSelectedBoy(boyId);

                const boy = boys.find(
                  (b) => String(b.id) === String(boyId)
                );

                if (boy) {
                  // Auto Fill Old Data
                  setName(boy.name);
                  setMobile(boy.mobile);
                  setVehicleType(boy.vehicle_type);
                  setVehicleNumber(boy.vehicle_number);
                } else {
                  // Reset if none selected
                  setName("");
                  setMobile("");
                  setVehicleType("");
                  setVehicleNumber("");
                }
              }}
            >
              <option value="">-- Select Delivery Boy --</option>

              {boys.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.mobile})
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}