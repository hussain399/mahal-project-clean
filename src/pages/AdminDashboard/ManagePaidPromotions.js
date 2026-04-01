import React, { useEffect, useState, useMemo } from "react";

import axios from "axios";
import Select from "react-select";

const API = "http://127.0.0.1:5000/api/admin/promotions";

export default function ManagePaidPromotions() {

  const token = localStorage.getItem("admin_token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // =========================================================
  // MAIN STATES
  // =========================================================

  const [promotions, setPromotions] = useState([]);
  const [requests, setRequests] = useState([]);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);

  const productOptions = useMemo(() =>
    products.map(p => ({
      value: p.product_id,
      label: p.product_name_english
    })),
    [products]);

  // FORM STATE

  const [form, setForm] = useState({
    supplier: null,
    products: [],
    categories: [],
    subcategories: [],
    priority: 5,
    city: "",
    start_date: "",
    end_date: "",
    banner_title: "",
    banner_subtitle: "",
    banner_url: "",
    grid_position: "GRID_SUPPLIER_1"
  });

  const QATAR_CITIES = [
    "Doha",
    "Al Rayyan",
    "Al Wakrah",
    "Lusail",
    "Al Khor",
    "Umm Salal",
    "Al Shamal",
    "Dukhan"
  ];

  const [selectedCities, setSelectedCities] = useState([]);

  // =========================================================
  // LOAD DATA
  // =========================================================
  const loadPromotions = async () => {

    const res = await axios.get(`${API}/list`, authHeader);

    const unique = Object.values(
      res.data.reduce((acc, item) => {
        acc[item.promotion_id] = item;
        return acc;
      }, {})
    );

    setPromotions(unique);

  };

  const loadRequests = async () => {
    const res = await axios.get(`${API}/requests`, authHeader);
    setRequests(res.data);
  };

  const loadSuppliers = async () => {
    const res = await axios.get(`${API}/suppliers`, authHeader);
    setSuppliers(res.data);
  };

  const loadCategories = async () => {
    const res = await axios.get(`${API}/categories`, authHeader);
    setCategories(res.data);
  };

  useEffect(() => {

    loadPromotions();
    loadRequests();
    loadSuppliers();
    loadCategories();

    const interval = setInterval(() => {

      loadPromotions();

    }, 10000);

    return () => clearInterval(interval);

  }, []);



  // =========================================================
  // LOAD PRODUCTS WHEN SUPPLIER SELECTED
  // =========================================================
  const toggleCity = (city) => {

    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }

  };

  const onSupplierChange = async (supplier) => {

    setForm(prev => ({
      ...prev,
      supplier,
      products: []
    }));

    const res = await axios.get(
      `${API}/supplier/${supplier.value}/products`,
      authHeader
    );

    setProducts(res.data);
    setSelectedProducts([]);
    setSelectAllProducts(false);
    setSelectedCities([]);


  };
  const toggleProduct = (product_id) => {

    if (selectedProducts.includes(product_id)) {
      setSelectedProducts(selectedProducts.filter(id => id !== product_id));
    } else {
      setSelectedProducts([...selectedProducts, product_id]);
    }

  };

  const toggleSelectAllProducts = () => {

    if (selectAllProducts) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.product_id));
    }

    setSelectAllProducts(!selectAllProducts);

  };



  // =========================================================
  // CREATE PROMOTION
  // =========================================================

  const createPromotion = async () => {

    if (!form.start_date || !form.end_date) {
      alert("Start and End date required");
      return;
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      alert("End date must be after start date");
      return;
    }

    if (!form.supplier) {
      alert("Select supplier");
      return;
    }

    if (selectedCities.length === 0) {
      alert("Select at least one city");
      return;
    }

    try {

      let createdPromotions = [];

      for (const city of selectedCities) {

        try {

          const res = await axios.post(
            `${API}/create`,
            {
              supplier_id: form.supplier.value,
              product_ids: selectedProducts,   // 🔥 CRITICAL FIX
              promotion_type: "PAID",
              city,
              priority: form.priority,
              start_date: new Date(form.start_date).toISOString(),
              end_date: new Date(form.end_date).toISOString()
            },
            authHeader
          );

          createdPromotions.push({
            city,
            promotion_id: res.data.promotion_id,
            reused: res.data.existing === true
          });

        } catch (err) {

          alert(
            err.response?.data?.message ||
            err.response?.data?.error ||
            `Failed for ${city}`
          );

        }
      }

      // ============================
      // ATTACH BANNER SAFELY
      // ============================

      if (form.banner_url && createdPromotions.filter(p => p.promotion_id).length > 0) {

        for (const promo of createdPromotions) {

          try {

            await axios.post(
              `${API}/${promo.promotion_id}/banner`,
              {
                original_image_url: form.banner_url,
                processed_image_url: form.banner_url,
                banner_title: form.banner_title,
                banner_subtitle: form.banner_subtitle,
                grid_position: form.grid_position,
                priority: form.priority,
                replace_existing: false
              },
              authHeader
            );

          } catch (err) {

            if (err.response?.data?.error === "GRID_OCCUPIED") {

              const shouldReplace = window.confirm(
                `Grid occupied in ${promo.city}. Replace it?`
              );

              if (!shouldReplace) continue;

              try {

                await axios.post(
                  `${API}/${promo.promotion_id}/banner`,
                  {
                    original_image_url: form.banner_url,
                    processed_image_url: form.banner_url,
                    banner_title: form.banner_title,
                    banner_subtitle: form.banner_subtitle,
                    grid_position: form.grid_position,
                    priority: form.priority,
                    replace_existing: true
                  },
                  authHeader
                );

              } catch (replaceErr) {

                alert(
                  replaceErr.response?.data?.message ||
                  "Replace failed"
                );

              }

            } else {

              alert(
                err.response?.data?.message ||
                "Banner failed"
              );

            }

          }

        }

      }

      // ============================
      // RESET FORM
      // ============================

      setForm({
        supplier: null,
        products: [],
        categories: [],
        subcategories: [],
        priority: 5,
        city: "",
        start_date: "",
        end_date: "",
        banner_title: "",
        banner_subtitle: "",
        banner_url: "",
        grid_position: "GRID_SUPPLIER_1"
      });

      setSelectedProducts([]);
      setSelectedCities([]);
      setSelectAllProducts(false);
      setShowModal(false);

      loadPromotions();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create promotion"
      );
    }
  };



  // =========================================================
  // REQUEST APPROVAL
  // =========================================================

  const approveRequest = async (request) => {

    try {

      await axios.put(
        `${API}/requests/${request.request_id}/approve`,
        {},
        authHeader
      );

      await axios.post(
        `${API}/create`,
        {
          request_id: request.request_id,
          supplier_id: request.supplier_id,
          product_ids: request.product_id ? [request.product_id] : [],
          promotion_type: "PAID",
          city: "Doha",
          priority: 10,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 86400000).toISOString()
        },
        authHeader
      );

      await loadRequests();
      await loadPromotions();

    } catch (err) {

      if (err.response?.status === 409) {

        alert(
          err.response.data.message ||
          err.response.data.error
        );

        return;
      }

      console.error(err);
      alert("Approval failed");
    }
  };

  const rejectRequest = async (id) => {

    await axios.put(
      `${API}/requests/${id}/reject`,
      {},
      authHeader
    );

    loadRequests();

  };

  const deletePromotion = async (id) => {

    if (!window.confirm("Delete promotion?")) return;

    await axios.put(
      `${API}/${id}/status`,
      { status: "DELETED" },
      authHeader
    );

    loadPromotions();

  };
  const getDuration = (start, end) => {

    const now = new Date();
    const endDate = new Date(end);

    const diff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return "Expired";

    return diff + " days left";

  };


  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const changeStatus = async (id, status) => {

    try {

      await axios.put(
        `${API}/${id}/status`,
        { status },
        authHeader
      );

      loadPromotions();

    } catch (err) {

      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Status update failed"
      );
    }
  };
  const editPromotion = async (promotion) => {

    const newPriority = prompt("Enter new priority:", promotion.priority);

    if (!newPriority) return;

    await axios.put(
      `${API}/${promotion.promotion_id}`,
      {
        priority: Number(newPriority),
        city: promotion.city,
        start_date: promotion.start_date,
        end_date: promotion.end_date
      },
      authHeader
    );

    loadPromotions();

  };


  // =========================================================
  // BADGES
  // =========================================================

  const priorityBadge = (priority) => {

    let label = "Silver";

    if (priority >= 10) label = "Platinum";
    else if (priority >= 5) label = "Gold";

    return <span className="badge bg-primary">{label}</span>;

  };

  const statusBadge = (status) => {

    const colors = {
      ACTIVE: "green",
      PAUSED: "orange",
      EXPIRED: "gray",
      REPLACED: "purple",
      DELETED: "red"
    };


    return (
      <span style={{
        padding: "4px 10px",
        background: colors[status],
        color: "white",
        borderRadius: "6px"
      }}>
        {status}
      </span>
    );

  };

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="container mt-4">

      <h2>Manage Paid Promotions</h2>

      <button
        className="btn btn-success btn-sm mb-3"
        onClick={() => setShowModal(true)}
      >
        Create Promotion
      </button>

      {/* ========================================================= */}
      {/* MODAL */}
      {/* ========================================================= */}

      {showModal && (

        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5>Create Supplier Promotion Campaign</h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />

              </div>

              <div className="modal-body">

                <label>Supplier</label>

                <Select
                  options={suppliers.map(s => ({
                    value: s.supplier_id,
                    label: s.company_name_english
                  }))}
                  value={form.supplier}
                  onChange={(supplier) => {

                    if (!supplier) {

                      setForm({
                        supplier: null,
                        products: [],
                        categories: [],
                        subcategories: [],
                        priority: 5,
                        city: "",
                        start_date: "",
                        end_date: "",
                        banner_title: "",
                        banner_subtitle: "",
                        banner_url: "",
                        grid_position: "GRID_SUPPLIER_1"
                      });

                      setProducts([]);
                      setSelectedProducts([]);
                      setSelectedCities([]);
                      setSelectAllProducts(false);
                      return;


                    }

                    onSupplierChange(supplier);

                  }}
                  isClearable
                />

                <label className="mt-3 d-flex justify-content-between align-items-center">
                  <span>Products</span>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary py-0 px-2"
                    onClick={() => {

                      if (selectAllProducts) {
                        setSelectedProducts([]);
                        setSelectAllProducts(false);
                      } else {
                        const all = products.map(p => p.product_id);
                        setSelectedProducts(all);
                        setSelectAllProducts(true);
                      }

                    }}
                  >
                    {selectAllProducts ? "Unselect" : "Select All"}
                  </button>
                </label>

                <Select
                  options={productOptions}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}

                  value={productOptions.filter(option =>
                    selectedProducts.includes(option.value)
                  )}

                  onChange={(selected) => {

                    const values = selected ? selected.map(s => s.value) : [];

                    setSelectedProducts(values);

                    setSelectAllProducts(values.length === productOptions.length);

                  }}

                  components={{
                    Option: (props) => {

                      return (
                        <div
                          ref={props.innerRef}
                          {...props.innerProps}
                          style={{
                            padding: "8px",
                            background: props.isFocused ? "#eee" : "#fff"
                          }}
                        >

                          <input
                            type="checkbox"
                            checked={props.isSelected}
                            readOnly
                          />

                          <span style={{ marginLeft: "8px" }}>
                            {props.label}
                          </span>

                        </div>
                      );
                    }
                  }}
                />



                <label className="mt-3 d-flex justify-content-between align-items-center">
                  <span>Cities</span>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary py-0 px-2"
                    onClick={() => {

                      if (selectedCities.length === QATAR_CITIES.length) {
                        setSelectedCities([]);
                      } else {
                        setSelectedCities(QATAR_CITIES);
                      }

                    }}
                  >
                    {selectedCities.length === QATAR_CITIES.length
                      ? "Unselect"
                      : "Select All"}
                  </button>
                </label>

                <div style={{ border: "1px solid #ddd", padding: "10px" }}>

                  {QATAR_CITIES.map(city => (

                    <div key={city}>

                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => toggleCity(city)}
                      />

                      {city}

                    </div>

                  ))}

                </div>


                <label className="mt-2">Priority</label>

                <select
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, priority: Number(e.target.value) }))
                  }
                >
                  <option value="1">Silver</option>
                  <option value="5">Gold</option>
                  <option value="10">Platinum</option>
                </select>

                <label className="mt-2">Start Date</label>

                <input
                  type="datetime-local"
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, start_date: e.target.value }))
                  }
                />
                <label className="mt-2">Grid Position</label>

                <select
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, grid_position: e.target.value }))
                  }
                >

                  {/* LEFT SLIDER */}
                  <option value="LEFT_SLIDER_1">
                    Left Slider 1
                  </option>

                  <option value="LEFT_SLIDER_2">
                    Left Slider 2
                  </option>

                  <option value="LEFT_SLIDER_3">
                    Left Slider 3
                  </option>

                  {/* RIGHT SLIDER */}
                  <option value="RIGHT_SLIDER_1">
                    Right Slider 1
                  </option>

                  <option value="RIGHT_SLIDER_2">
                    Right Slider 2
                  </option>

                  <option value="RIGHT_SLIDER_3">
                    Right Slider 3
                  </option>

                  {/* OPTIONAL: KEEP OLD (if still used elsewhere) */}
                  <option value="GRID_SUPPLIER_1">
                    Supplier Grid 1 (Top)
                  </option>

                  <option value="GRID_SUPPLIER_2">
                    Supplier Grid 2 (Bottom)
                  </option>

                </select>


                <label className="mt-2">End Date</label>

                <input
                  type="datetime-local"
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, end_date: e.target.value }))
                  }
                />

                <label className="mt-2">Banner URL</label>

                <input
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, banner_url: e.target.value }))
                  }
                />

                <label className="mt-2">Banner Title</label>

                <input
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, banner_title: e.target.value }))
                  }
                />

                <label className="mt-2">Banner Subtitle</label>

                <input
                  className="form-control"
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, banner_subtitle: e.target.value }))
                  }
                />

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-success btn-sm"
                  onClick={createPromotion}
                >
                  Create
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ========================================================= */}
      {/* REQUEST TABLE */}
      {/* ========================================================= */}

      <h4>Supplier Requests</h4>

      <table className="table">

        <tbody>

          {requests.map(r => (
            <tr key={r.request_id}>
              <td>{r.company_name_english}</td>
              <td>{r.product_name_english}</td>
              <td>
                {r.start_date && r.end_date
                  ? getDuration(r.start_date, r.end_date)
                  : "—"}
              </td>

              <td>{r.status}</td>

              <td>

                <button
                  className="btn btn-success btn-sm"
                  onClick={() => approveRequest(r)}
                >
                  Approve
                </button>

                <button
                  className="btn btn-danger btn-sm ms-2"
                  onClick={() => rejectRequest(r.request_id)}
                >
                  Reject
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

      {/* ========================================================= */}
      {/* PROMOTION TABLE */}
      {/* ========================================================= */}

      <h4>Active Promotions</h4>

      <table className="table">

        <tbody>

          {promotions.map(p => (
            <tr key={`${p.promotion_id}-${p.city}`}>

              <td>{p.promotion_type} Campaign</td>

              <td>{p.company_name_english}</td>

              <td>{p.city}</td>

              <td>{priorityBadge(p.priority)}</td>

              <td>{getDuration(p.start_date, p.end_date)}</td>

              <td>{statusBadge(p.status)}</td>

              <td>

                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => changeStatus(p.promotion_id, "PAUSED")}
                >
                  Pause
                </button>

                <button
                  className="btn btn-success btn-sm ms-2"
                  onClick={() => changeStatus(p.promotion_id, "ACTIVE")}
                >
                  Resume
                </button>

                <button
                  className="btn btn-danger btn-sm ms-2"
                  onClick={() => changeStatus(p.promotion_id, "EXPIRED")}
                >
                  Stop
                </button>
                <button
                  className="btn btn-primary btn-sm ms-2"
                  onClick={() => editPromotion(p)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm ms-2"
                  onClick={() => deletePromotion(p.promotion_id)}
                >
                  Delete
                </button>



              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

}