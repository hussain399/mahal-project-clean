
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const API_BASE = "http://127.0.0.1:5000/api/v1/coupons";

export default function CouponManagement() {
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin/login";
    }
  }, [token]);

  const authHeader = React.useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }), [token]);

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [allCoupons, setAllCoupons] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // default form state
  const emptyForm = {
    code: "",
    title: "",
    description: "",

    discount_type: "PERCENTAGE",
    discount_value: "",

    min_order_value: "",
    max_discount: "",

    start_date: "",
    end_date: "",

    usage_limit_total: "",
    usage_limit_per_restaurant: "",

    absorb_type: "PLATFORM",
    supplier_share_percent: 0,

    first_order_only: false,
    stackable: false,


    campaign_id: "",
    total_budget: "",
    priority: 1,

    scope_type: "GLOBAL",
    supplier_ids: [],
    category_ids: [],
  };

  const [form, setForm] = useState(emptyForm);
  /* =======================================================
     FETCH COUPONS
  ======================================================= */
  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/list`, authHeader);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch coupons");
      }

      const data = await res.json();
      setCoupons(data);
      setAllCoupons(data);
      return true;
    } catch (err) {
      setError("Failed to load coupons");
      return false;
    }
  };

  const fetchSuppliers = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/suppliers`,
        authHeader
      );

      if (!res.ok) throw new Error("Failed to load suppliers");

      const data = await res.json();
      setSuppliers(data);

    } catch {
      console.error("Failed to load suppliers");
    }

  };

  const fetchCategories = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/categories`,
        authHeader
      );

      if (!res.ok) throw new Error("Failed to load categories");

      const data = await res.json();

      setCategories(data);

    } catch (err) {

      console.error(err);

    }

  };

  const fetchCampaigns = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/campaigns`,
        authHeader
      );

      if (!res.ok) throw new Error("Failed to load campaigns");

      const data = await res.json();

      setCampaigns(data);

    } catch (err) {

      console.error("Failed to load campaigns", err);

    }

  };

  useEffect(() => {
    Promise.all([
      fetchCoupons(),
      fetchSuppliers(),
      fetchCategories(),
      fetchCampaigns()
    ]).finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [message]);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;

    if (type === "checkbox") finalValue = checked;
    if (type === "number") {
      finalValue = value === "" ? null : Number(value);
    }

    setForm(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  /* =======================================================
     CREATE COUPON
  ======================================================= */
  const createCoupon = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.code || !form.discount_value) {
      setError("Code and Discount Value are required");
      return;
    }

    if (form.start_date && form.end_date) {
      if (new Date(form.end_date) <= new Date(form.start_date)) {
        setError("End date must be after start date");
        return;
      }
    }

    if (
      form.absorb_type === "SHARED" &&
      (form.supplier_share_percent <= 0 ||
        form.supplier_share_percent > 100)
    ) {
      setError("Supplier share must be between 1-100%");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value || 0),
        max_discount: form.max_discount ? Number(form.max_discount) : null,

        start_date: form.start_date
          ? new Date(form.start_date).toLocaleString("sv-SE").replace(" ", "T")
          : null,

        end_date: form.end_date
          ? new Date(form.end_date).toLocaleString("sv-SE").replace(" ", "T")
          : null,

        usage_limit_total: Number(form.usage_limit_total || 0),
        usage_limit_per_restaurant: Number(form.usage_limit_per_restaurant || 0),

        absorb_type: form.absorb_type,
        supplier_share_percent: Number(form.supplier_share_percent || 0),

        first_order_only: form.first_order_only,
        stackable: form.stackable,

        campaign_id: form.campaign_id ? Number(form.campaign_id) : null,
        total_budget: form.total_budget ? Number(form.total_budget) : null,
        priority: form.priority || 1,

        /* FIX */
        scope_type: form.scope_type,
        supplier_ids: form.supplier_ids.filter(Boolean).map(Number),
        category_ids: form.category_ids.map(Number)
      };

      const res = await fetch(`${API_BASE}/admin/create`, {
        method: "POST",
        ...authHeader,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const couponId = data.coupon.coupon_id;




      // /* ================= CATEGORY ================= */

      // if (form.scope_type === "CATEGORY" && form.category_ids.length > 0) {

      //   for (let cat of form.category_ids) {

      //     await fetch(`${API_BASE}/admin/${couponId}/add-category`, {
      //       method: "POST",
      //       ...authHeader,
      //       body: JSON.stringify({
      //         category_id: cat
      //       })
      //     });

      //   }
      // }

      // /* ================= SUPPLIER TARGET ================= */

      // if (form.scope_type === "SUPPLIER" && form.supplier_id) {
      //   await fetch(`${API_BASE}/admin/${couponId}/targets`, {
      //     method: "POST",
      //     ...authHeader,
      //     body: JSON.stringify({
      //       supplier_id: Number(form.supplier_id)
      //     })
      //   });
      // }



      setMessage("Coupon created successfully");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setForm(emptyForm);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     UPDATE COUPON
  ======================================================= */
  const updateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      const res = await fetch(
        `${API_BASE}/admin/${selectedCoupon.coupon_id}`,
        {
          method: "PUT",
          ...authHeader,
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            discount_value: Number(form.discount_value),
            min_order_value: Number(form.min_order_value || 0),
            max_discount: form.max_discount ? Number(form.max_discount) : null,
            usage_limit_total: Number(form.usage_limit_total || 0),
            usage_limit_per_restaurant: Number(form.usage_limit_per_restaurant || 0),
            priority: Number(form.priority || 1),
            end_date: form.end_date
              ? new Date(form.end_date).toISOString()
              : null
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }
      setMessage("Coupon updated");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSelectedCoupon(null);
      setForm(emptyForm);
      fetchCoupons();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  /* =======================================================
     DEACTIVATE
  ======================================================= */
  const deactivateCoupon = async (id) => {
    if (!window.confirm("Deactivate this coupon?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/admin/${id}/deactivate`,
        {
          method: "PATCH",
          ...authHeader,
        }
      );

      if (!res.ok) throw new Error("Failed");
      setMessage("Coupon deactivated");
      fetchCoupons();
    } catch {
      setError("Failed to deactivate");
    }
  };


  const activateCoupon = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/${id}/activate`,
        {
          method: "PATCH",
          ...authHeader,
        }
      );

      if (!res.ok) throw new Error("Failed");
      setMessage("Coupon activated");
      fetchCoupons();
    } catch {
      setError("Failed to activate");
    }
  };
  /* =======================================================
     ADD TARGET
  ======================================================= */
  const addTarget = async (couponId) => {
    const restaurant_id = prompt("Enter Restaurant ID (optional)");
    const supplier_id = prompt("Enter Supplier ID (optional)");
    const segment = prompt("Enter Segment (optional)");

    try {
      const res = await fetch(
        `${API_BASE}/admin/${couponId}/targets`,
        {
          method: "POST",
          ...authHeader,
          body: JSON.stringify({
            restaurant_id: restaurant_id || null,
            supplier_id: supplier_id || null,
            segment: segment || null,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");
      alert("Target added");
    } catch {
      alert("Error adding target");
    }
  };

  if (initialLoading) {
    return <div className="text-center mt-5">Loading coupons...</div>;
  }
  return (
    <div className="container py-4">
      <Helmet>
        <title>Admin Coupon Management</title>
      </Helmet>

      <h2 className="mb-4">Coupon Management</h2>
      <p>Total Coupons: {coupons.length}</p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ================= CREATE FORM ================= */}
      <div className="card mb-4 p-4">
        <h4>Create Coupon</h4>

        <form onSubmit={selectedCoupon ? (e) => { e.preventDefault(); updateCoupon(); } : createCoupon}>
          <div className="row">

            <button
              type="button"
              className="btn btn-sm btn-danger mb-3"
              onClick={async () => {

                if (!window.confirm("Deactivate all expired coupons?")) return;

                try {
                  const res = await fetch(`${API_BASE}/admin/auto-deactivate`, {
                    method: "POST",
                    ...authHeader
                  });

                  const data = await res.json();

                  setMessage(`Expired coupons cleaned: ${data.updated}`);
                  fetchCoupons();

                } catch {
                  setError("Failed to clean expired coupons");
                }

              }}
            >
              Clean Expired Coupons
            </button>

            {/* CODE */}
            <div className="col-md-4 mb-3">
              <label>Coupon Code</label>
              <input
                type="text"
                className="form-control"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                disabled={selectedCoupon !== null}
              />
            </div>

            {/* TITLE */}
            <div className="col-md-4 mb-3">
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-md-4 mb-3">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* DISCOUNT TYPE */}
            <div className="col-md-4 mb-3">
              <label>Discount Type</label>
              <select
                className="form-control"
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat Amount</option>
              </select>
            </div>

            {/* DISCOUNT VALUE */}
            <div className="col-md-4 mb-3">
              <label>Discount Value</label>
              <input
                type="number"
                className="form-control"
                name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                required
              />
            </div>

            {/* MIN ORDER */}
            <div className="col-md-4 mb-3">
              <label>Minimum Order Value</label>
              <input
                type="number"
                className="form-control"
                name="min_order_value"
                value={form.min_order_value}
                onChange={handleChange}
              />
            </div>

            {/* MAX DISCOUNT */}
            <div className="col-md-4 mb-3">
              <label>Max Discount Cap</label>
              <input
                type="number"
                className="form-control"
                name="max_discount"
                value={form.max_discount}
                onChange={handleChange}
              />
            </div>

            {/* START DATE */}
            <div className="col-md-4 mb-3">
              <label>Start Date</label>
              <input
                type="datetime-local"
                className="form-control"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* END DATE */}
            <div className="col-md-4 mb-3">
              <label>End Date</label>
              <input
                type="datetime-local"
                className="form-control"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* TOTAL USAGE */}
            <div className="col-md-4 mb-3">
              <label>Total Usage Limit</label>
              <input
                type="number"
                className="form-control"
                name="usage_limit_total"
                value={form.usage_limit_total}
                onChange={handleChange}
              />
            </div>

            {/* PER RESTAURANT */}
            <div className="col-md-4 mb-3">
              <label>Usage Per Restaurant</label>
              <input
                type="number"
                className="form-control"
                name="usage_limit_per_restaurant"
                value={form.usage_limit_per_restaurant}
                onChange={handleChange}
              />
            </div>

            {/* ABSORB TYPE */}
            <div className="col-md-4 mb-3">
              <label>Absorb Type</label>
              <select
                className="form-control"
                name="absorb_type"
                value={form.absorb_type}
                onChange={handleChange}
              >
                <option value="PLATFORM">Platform</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="SHARED">Shared</option>
              </select>
            </div>

            {form.absorb_type === "SHARED" && (
              <div className="col-md-4 mb-3">
                <label>Supplier Share %</label>
                <input
                  type="number"
                  className="form-control"
                  name="supplier_share_percent"
                  value={form.supplier_share_percent}
                  onChange={handleChange}
                />
              </div>
            )}



            {/* SCOPE */}
            <div className="col-md-4 mb-3">
              <label>Coupon Scope</label>
              <select
                className="form-control"
                name="scope_type"
                value={form.scope_type}
                onChange={handleChange}
              >
                <option value="GLOBAL">Global</option>
                <option value="CATEGORY">Category Wise</option>
                <option value="SUPPLIER">Supplier Wise</option>
              </select>
            </div>

            {form.scope_type === "CATEGORY" && (
              <div className="col-md-4 mb-3">
                <label>Categories</label>

                <div className="border p-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {categories.map((c) => (
                    <div className="form-check" key={c.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`cat-${c.id}`}
                        checked={form.category_ids.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm(prev => ({
                              ...prev,
                              category_ids: [...prev.category_ids, c.id]
                            }));
                          } else {
                            setForm(prev => ({
                              ...prev,
                              category_ids: prev.category_ids.filter(id => id !== c.id)
                            }));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`cat-${c.id}`}>
                        {c.name}
                      </label>
                    </div>
                  ))}
                </div>

                <small className="text-muted">
                  Select multiple categories using checkboxes
                </small>
              </div>
            )}



            {form.scope_type === "SUPPLIER" && (
              <div className="col-md-4 mb-3">
                <label>Suppliers</label>

                {/* Selected preview */}
                {form.supplier_ids.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">
                      Selected: {form.supplier_ids.length}
                    </small>
                  </div>
                )}

                <div
                  className="border rounded p-2"
                  style={{ maxHeight: "220px", overflowY: "auto" }}
                >
                  {suppliers.length === 0 && (
                    <div className="text-muted small">No suppliers found</div>
                  )}

                  {suppliers.map((s) => {
                    const isChecked = form.supplier_ids.includes(s.supplier_id);

                    return (
                      <div className="form-check" key={s.supplier_id}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`sup-${s.supplier_id}`}
                          checked={isChecked}
                          onChange={(e) => {
                            setForm(prev => ({
                              ...prev,
                              supplier_ids: e.target.checked
                                ? [...prev.supplier_ids, s.supplier_id]
                                : prev.supplier_ids.filter(id => id !== s.supplier_id)
                            }));
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`sup-${s.supplier_id}`}
                        >
                          {s.company_name_english || `Supplier #${s.supplier_id}`}
                        </label>
                      </div>
                    );
                  })}
                </div>

                <small className="text-muted">
                  Select multiple suppliers
                </small>
              </div>
            )}

            {/* CAMPAIGN */}
            <div className="col-md-4 mb-3">
              <label>Campaign ID</label>
              <select
                className="form-control"
                name="campaign_id"
                value={form.campaign_id}
                onChange={handleChange}
              >

                <option value="">No Campaign</option>

                {campaigns.map(c => (
                  <option key={c.campaign_id} value={c.campaign_id}>
                    {c.name || "Unnamed Campaign"}
                  </option>
                ))}

              </select>
            </div>

            {/* TOTAL BUDGET */}
            <div className="col-md-4 mb-3">
              <label>Total Budget</label>
              <input
                type="number"
                className="form-control"
                name="total_budget"
                value={form.total_budget}
                onChange={handleChange}
              />
            </div>

            {/* PRIORITY */}
            <div className="col-md-4 mb-3">
              <label>Priority</label>
              <input
                type="number"
                className="form-control"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* FLAGS */}
          <div className="row mt-2">

            <div className="col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="first_order_only"
                  checked={form.first_order_only}
                  onChange={handleChange}
                />
                <label className="form-check-label">
                  First Order Only
                </label>
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="stackable"
                  checked={form.stackable}
                  onChange={handleChange}
                />
                <label className="form-check-label">
                  Stackable
                </label>
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm mt-3"
            disabled={
              loading ||
              !form.code ||
              !form.discount_value ||
              Number(form.discount_value) <= 0
            }
          >
            {loading
              ? "Saving..."
              : selectedCoupon
                ? "Update Coupon"
                : "Create Coupon"}
          </button>

          {selectedCoupon && (
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-3 ms-2"
              onClick={() => {
                setSelectedCoupon(null);
                setForm(emptyForm);
                setError("");
                setMessage("");
              }}
            >
              Cancel Edit
            </button>
          )}

        </form>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card p-4 mb-4">
        <h5>Filters</h5>

        <div className="row">

          <div className="col-md-3">
            <input
              type="text"
              placeholder="Search code..."
              className="form-control"
              onChange={(e) => {
                const value = e.target.value.trim().toLowerCase();

                setCoupons(
                  allCoupons.filter(c =>
                    (c.code || "").toLowerCase().includes(value)
                  )
                );
              }}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-control"
              onChange={(e) => {
                const status = e.target.value;

                if (status === "ALL") {
                  setCoupons(allCoupons);
                  return;
                }

                setCoupons(
                  allCoupons.filter(c =>
                    status === "ACTIVE"
                      ? c.is_active
                      : !c.is_active
                  )
                );
              }}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-control"
              onChange={(e) => {
                const type = e.target.value;

                if (type === "ALL") {
                  setCoupons(allCoupons);
                  return;
                }

                setCoupons(
                  allCoupons.filter(c => c.discount_type === type)
                );
              }}
            >
              <option value="ALL">All Types</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat</option>
            </select>
          </div>

        </div>
      </div>
      <div className="card p-4">
        <h4>All Coupons</h4>

        <div style={{ overflowX: "auto", maxHeight: "600px" }}>
          <table className="table table-bordered table-striped">
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Title</th>
                <th>Description</th>
                <th>Type</th>
                <th>Value</th>
                <th>Suppliers</th>
                <th>Min Order</th>
                <th>Max Discount</th>

                <th>Priority</th>
                <th>Campaign ID</th>   {/* ✅ NEW */}

                <th>Total Budget</th>
                <th>Usage</th>
                <th>Scope Type</th>   {/* ✅ NEW */}

                <th>Platform Cost</th>
                <th>Supplier Cost</th>
                <th>Total Discount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Created At</th>   {/* ✅ NEW */}
                <th style={{ position: "sticky", right: 0, background: "#fff" }}>
                  Status
                </th>
                <th style={{ position: "sticky", right: 0, background: "#fff" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((c) => (
                <tr key={c.coupon_id}>

                  <td>{c.coupon_id}</td>
                  <td>
                    {c.code}
                    <button
                      className="btn btn-sm btn-light ms-2"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(c.code);
                          setMessage("Coupon code copied");
                        } catch {
                          setError("Copy failed");
                        }
                      }}
                    >
                      Copy
                    </button>
                  </td>
                  <td>{c.title}</td>
                  <td>{c.description}</td>
                  <td>{c.discount_type}</td>
                  <td>{c.discount_value}</td>
                  <td>
                    {c.scope_type === "SUPPLIER" ? (
                      c.supplier_ids && c.supplier_ids.length > 0 ? (
                        <div style={{ maxWidth: "200px" }}>
                          {c.supplier_ids.slice(0, 3).map(id => {
                            const supplier = suppliers.find(s => s.supplier_id === id);
                            return (
                              <div key={id}>
                                {supplier?.supplier_id || `#${id}`}
                              </div>
                            );
                          })}

                          {c.supplier_ids.length > 3 && (
                            <small className="text-muted">
                              +{c.supplier_ids.length - 3} more
                            </small>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">None</span>
                      )
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{c.min_order_value}</td>
                  <td>{c.max_discount}</td>

                 <td>{c.priority}</td>

                  <td>{c.campaign_id || "-"}</td>

                  <td>{c.total_budget || "-"}</td>

                  <td>
                    {c.total_usage}/{c.usage_limit_total || "∞"}

                    {c.usage_limit_total && c.usage_limit_total > 0 && (
                      <div className="progress mt-1" style={{ height: "6px" }}>
                        <div
                          className={`progress-bar ${
                            (c.total_usage / c.usage_limit_total) > 0.8
                              ? "bg-danger"
                              : (c.total_usage / c.usage_limit_total) > 0.5
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{
                            width: `${Math.min(
                              (c.total_usage / c.usage_limit_total) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    )}
                  </td>

                  <td>{c.scope_type || "-"}</td>

                  <td>{c.total_platform_cost || 0}</td>

                  <td>{c.total_supplier_cost || 0}</td>

                  <td>{c.total_discount || 0}</td>

                  <td>
                    {c.start_date
                      ? new Date(c.start_date).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {c.end_date
                      ? new Date(c.end_date).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td style={{ position: "sticky", right: "90px", background: "#fff" }}>
                    {(() => {
                      const expired = c.end_date && new Date(c.end_date) < new Date();

                      if (expired) {
                        return <span className="badge bg-secondary">Expired</span>;
                      }

                      return (
                        <span className={`badge ${c.is_active ? "bg-success" : "bg-danger"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      );
                    })()}
                  </td>

                  <td style={{ position: "sticky", right: 0, background: "#fff" }}>
                    <button
                      className="btn btn-sm btn-info me-2"
                      disabled={c.end_date && new Date(c.end_date) < new Date()}
                      onClick={() => {
                        setMessage("");
                        setError("");
                        setSelectedCoupon(c);

                        window.scrollTo({ top: 0, behavior: "smooth" });

                        setForm({
                          ...emptyForm,
                          code: c.code,
                          title: c.title || "",
                          description: c.description || "",
                          discount_type: c.discount_type,
                          discount_value: c.discount_value,
                          min_order_value: c.min_order_value || "",
                          max_discount: c.max_discount || "",
                          start_date: c.start_date
                            ? new Date(c.start_date).toISOString().slice(0, 16)
                            : "",
                          end_date: c.end_date
                            ? new Date(c.end_date).toISOString().slice(0, 16)
                            : "",
                          usage_limit_total: c.usage_limit_total || "",
                          usage_limit_per_restaurant: c.usage_limit_per_restaurant || "",
                          absorb_type: c.absorb_type,
                          supplier_share_percent: c.supplier_share_percent || 0,
                          first_order_only: c.first_order_only,
                          stackable: c.stackable,

                          campaign_id: c.campaign_id || "",
                          total_budget: c.total_budget || "",
                          priority: c.priority || 1
                        });
                      }}
                    >
                      Edit
                    </button>

                    {c.is_active ? (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => deactivateCoupon(c.coupon_id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        disabled={c.end_date && new Date(c.end_date) < new Date()}
                        onClick={() => activateCoupon(c.coupon_id)}
                      >
                        Activate
                      </button>


                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
