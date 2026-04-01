import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../pages/css/SupplierPromotions.css";

const API = "http://127.0.0.1:5000/api/v1";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const SupplierPromotionRequest = () => {

  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("PRODUCT");
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProductTabProducts, setSelectedProductTabProducts] = useState([]);
  const [selectedCategoryTabProducts, setSelectedCategoryTabProducts] = useState([]);
  const [categorySearchKeyword, setCategorySearchKeyword] = useState("");
  const [categoryResults, setCategoryResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cities, setCities] = useState([]);
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectAllInCategory, setSelectAllInCategory] = useState(false);

  const [form, setForm] = useState({
    title: "",
    headline: "",
    description: "",
    offer_type: "",
    offer_value: "",
    banner: null,
    priority_level: "HIGH",
    cities: [],
    applyToAll: false,
    bid_amount: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    axios.get(`${API}/supplier/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProducts(res.data))
    .catch(() => setProducts([]));
  }, [token]);

  useEffect(() => {
    axios.get(`${API}/supplier/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCategories(res.data))
    .catch(() => setCategories([]));
  }, [token]);

  useEffect(() => {
    axios.get(`${API}/master/city`)
      .then(res => setCities(res.data.data || []));
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchKeyword.trim()) {
      filtered = products.filter(p =>
        p.product_name_english
          .toLowerCase()
          .includes(searchKeyword.toLowerCase())
      );
    }

    filtered = filtered.filter(p =>
      !selectedProductTabProducts.some(sp => sp.product_id === p.product_id)
    );
    setSearchResults(filtered);
  }, [searchKeyword, products, selectedProductTabProducts]);

  useEffect(() => {
    if (!categorySearchKeyword.trim()) {
      setCategoryResults(categories);
      return;
    }
    const filtered = categories.filter(c =>
      c.category_name.toLowerCase().includes(categorySearchKeyword.toLowerCase())
    );
    setCategoryResults(filtered);
  }, [categorySearchKeyword, categories]);

  useEffect(() => {
    if (!activeCategory) return;

    if (selectAllInCategory) {
      setSelectedCategoryTabProducts(prev => {
        const merged = [
          ...prev,
          ...categoryProducts.filter(p =>
            !prev.some(sp => sp.product_id === p.product_id)
          )
        ];
        return merged;
      });
    } else {
      setSelectedCategoryTabProducts(prev =>
        prev.filter(p => p.category_id !== activeCategory.category_id)
      );
    }
  }, [selectAllInCategory, activeCategory, categoryProducts]);

  const toggleProductTabProduct = (product) => {
    const exists = selectedProductTabProducts.some(
      p => p.product_id === product.product_id
    );

    if (exists) {
      setSelectedProductTabProducts(
        selectedProductTabProducts.filter(p => p.product_id !== product.product_id)
      );
    } else {
      setSelectedProductTabProducts([
        ...selectedProductTabProducts,
        product
      ]);
    }
  };
  
  const toggleCategoryTabProduct = (product) => {
    const exists = selectedCategoryTabProducts.some(
      p => p.product_id === product.product_id
    );

    if (exists) {
      setSelectedCategoryTabProducts(
        selectedCategoryTabProducts.filter(p => p.product_id !== product.product_id)
      );
    } else {
      setSelectedCategoryTabProducts([
        ...selectedCategoryTabProducts,
        product
      ]);
    }
  };

  const fetchCategorySearch = async (keyword) => {
    setCategorySearchKeyword(keyword);

    if (!keyword.trim()) {
      setCategoryResults([]);
      return;
    }
    try {
      const res = await axios.get(
        `${API}/admin/categories/search?q=${keyword}`
      );
      setCategoryResults(res.data.data || []);
    } catch (err) {
      console.error("Category search error:", err);
    }
  };

  const handleCategoryClick = async (category) => {
    setActiveCategory(category);
    setSelectAllInCategory(false);
    try {
      const res = await axios.get(
        `${API}/supplier/category/${category.category_id}/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategoryProducts(res.data);
    } catch (err) {
      console.error("Category products error:", err);
    }
  };

  const removeCategoryProducts = () => {
    if (!activeCategory) return;
    const filtered = selectedCategoryTabProducts.filter(
      p => p.category_id !== activeCategory.category_id
    );
    setSelectedCategoryTabProducts(filtered);
    setSelectAllInCategory(false);
  };

  const resetForm = () => {
    if (!window.confirm("Clear this form?")) return;

    setSelectedProductTabProducts([]);
    setSelectedCategoryTabProducts([]);
    setSearchKeyword("");
    setActiveCategory(null);
    setCategoryProducts([]);
    setSelectAllInCategory(false);
    setActiveTab("PRODUCT");

    setForm({
      title: "",
      headline: "",
      description: "",
      offer_type: "",
      offer_value: "",
      banner: null,
      priority_level: "HIGH",
      cities: [],
      applyToAll: false,
      bid_amount: "",
      start_date: "",
      end_date: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submit = async () => {

    const finalSelectedProducts = [
      ...selectedProductTabProducts,
      ...selectedCategoryTabProducts
    ].filter((product, index, self) =>
      index === self.findIndex(p => p.product_id === product.product_id)
    );

    if (finalSelectedProducts.length === 0) {
      alert("Select at least one product");
      return;
    }

    if (!form.offer_type) {
      alert("Select offer type");
      return;
    }

    if (!form.offer_value) {
      alert("Enter offer value");
      return;
    }

    const payload = {
      target_type: activeTab,
      target_ids: finalSelectedProducts.map(p => p.product_id),
      priority_level: form.priority_level,
      bid_amount: form.bid_amount,
      start_date: form.start_date,
      end_date: form.end_date,
      title: form.title,
      headline: form.headline,
      description: form.description,
      offer_type: form.offer_type,
      offer_value: form.offer_value,
      banner_image: form.banner,
      location_scope: form.applyToAll ? "ALL" : "CITY",
      location_values: form.applyToAll ? cities : form.cities
    };

    await axios.post(
      `${API}/supplier/promotions/request`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Promotion Request Sent to Admin");
    resetForm();
  };

  return (
    <div className="promotion_container">
      <div className="promotion_card">

        <h2 className="promotion_heading">
          Request Paid Promotion
        </h2>

        <div className="tab_row">
          <button
            className={activeTab === "PRODUCT" ? "tab active" : "tab"}
            onClick={() => setActiveTab("PRODUCT")}
          >
            Products
          </button>

          <button
            className={activeTab === "CATEGORY" ? "tab active" : "tab"}
            onClick={() => setActiveTab("CATEGORY")}
          >
            Categories
          </button>
        </div>

        {activeTab === "PRODUCT" && (
          <>
            <div className="form_group">
              <label>Search Product</label>
              <input
                type="text"
                placeholder="Search product..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className="search_results">
              {searchResults.map(p => {

                const isSelected = selectedProductTabProducts.some(
                  sp => sp.product_id === p.product_id
                );

                return (
                  <div
                    key={p.product_id}
                    className={`result_item ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleProductTabProduct(p)}
                  >
                    {p.product_name_english}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "CATEGORY" && (
          <>
            <div className="form_group">
              <label>Search Category</label>
              <input
                type="text"
                placeholder="Search category..."
                value={categorySearchKeyword}
                onChange={(e) => fetchCategorySearch(e.target.value)}
              />
            </div>

            <div className="category_grid">
              {categoryResults.map(cat => (
                <div
                  key={cat.category_id}
                  // className="category_card"
                  className={`category_card ${
                    activeCategory?.category_id === cat.category_id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat.category_name}
                </div>
              ))}
            </div>

            {activeCategory && (
              <div className="category_products_section">

                <h4>
                  {activeCategory.category_name} Products
                </h4>

                {/* 🔥 ACTION ROW */}
                <div className="category_action_row">

                  <label>
                    <input
                      type="checkbox"
                      checked={selectAllInCategory}
                      onChange={(e) => setSelectAllInCategory(e.target.checked)}
                    />
                    Select All
                  </label>

                  <button
                    type="button"
                    className="remove_category_btn"
                    onClick={removeCategoryProducts}
                  >
                    Remove All
                  </button>

                </div>

                {/* 🔥 PRODUCT LIST */}
                <div className="search_results">
                  {categoryProducts.map(p => {

                    const isSelected = selectedCategoryTabProducts.some(
                      sp => sp.product_id === p.product_id
                    );

                    return (
                      <div
                        key={p.product_id}
                        className={`result_item ${isSelected ? "selected" : ""}`}
                        // onClick={() => toggleProduct(p)}
                        onClick={() => toggleCategoryTabProduct(p)}

                      >
                        {p.product_name_english}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </>
        )}

        {/* <div className="category_section">
          <h4>Your Categories</h4>

          <div className="category_grid">
            {categories.map(cat => {
              const isSelected = selectedCategory.some(
                p => p.category_id === cat.category_id
              );

              return (
                <div
                  key={cat.category_id}
                  className={`category_card ${isSelected ? "active" : ""}`}
                  onClick={async () => {

                    const res = await axios.get(
                      `${API}/supplier/category/${cat.category_id}/products`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    const categoryProducts = res.data;

                    if (isSelected) {
                      const filtered = selectedCategoryTabProducts.filter(
                        p => p.category_id !== cat.category_id
                      );
                      setSelectedCategoryTabProducts(filtered);
                    } else {
                      const merged = [
                        ...selectedCategoryTabProducts,
                        ...categoryProducts.filter(p =>
                          !selectedCategoryTabProducts.some(
                            sp => sp.product_id === p.product_id
                          )
                        )
                      ];
                      setSelectedCategoryTabProductss(merged);
                    }
                  }}
                >
                  <h5>{cat.category_name}</h5>
                  <p>{cat.product_count} Products</p>
                  <small>
                    {isSelected ? "Selected ✓" : "Click to select all"}
                  </small>
                </div>
              );
            })}
          </div>
        </div> */}

        {/* <div className="form_group">
          <label>Search Product</label>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div> */}

        {/* {searchResults.length > 0 && (
          <div className="search_results">
            {searchResults.map((p) => (
              <div
                key={p.product_id}
                // className="result_item"
                className={`result_item ${
                  selectedCategoryTabProducts.some(sp => sp.product_id === p.product_id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleProduct(p)}
              >
                <div className="result_title">
                  {p.product_name_english} (ID: {p.product_id})
                </div>
              </div>
            ))}
          </div>
        )} */}

        {(selectedProductTabProducts.length > 0 ||
          selectedCategoryTabProducts.length > 0) && (

          <div className="selected_section">
            <h4>Selected Products</h4>

            <div className="selected_list">

              {[...selectedProductTabProducts, ...selectedCategoryTabProducts]
                .filter((product, index, self) =>
                  index === self.findIndex(p => p.product_id === product.product_id)
                )
                .map((p) => {

                  const isFromProductTab =
                    selectedProductTabProducts.some(sp => sp.product_id === p.product_id);

                  return (
                    <div key={p.product_id} className="selected_chip">
                      {p.product_name_english} (ID: {p.product_id})

                      <span
                        onClick={() => {
                          if (isFromProductTab) {
                            setSelectedProductTabProducts(prev =>
                              prev.filter(prod => prod.product_id !== p.product_id)
                            );
                          } else {
                            setSelectedCategoryTabProducts(prev =>
                              prev.filter(prod => prod.product_id !== p.product_id)
                            );
                          }
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  );
                })}

            </div>
          </div>
        )}

        {/* TITLE */}
        <div className="form_group">
          <label>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        {/* HEADLINE */}
        <div className="form_group">
          <label>Headline</label>
          <input
            type="text"
            value={form.headline}
            onChange={(e) =>
              setForm({ ...form, headline: e.target.value })
            }
          />
        </div>

        {/* DESCRIPTION */}
        <div className="form_group">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        {/* OFFER TYPE */}
        <div className="form_group">
          <label>Offer Type</label>
          <select
            value={form.offer_type}
            onChange={(e) =>
              setForm({ ...form, offer_type: e.target.value })
            }
          >
            <option value="">Select Offer Type</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat Amount</option>
          </select>
        </div>

        {/* OFFER VALUE */}
        <div className="form_group">
          <label>Offer Value</label>
          <input
            type="number"
            value={form.offer_value}
            onChange={(e) =>
              setForm({ ...form, offer_value: e.target.value })
            }
          />
        </div>

        {/* BID */}
        <div className="form_group">
          <label>Bid Amount</label>
          <input
            type="number"
            value={form.bid_amount}
            onChange={(e) =>
              setForm({ ...form, bid_amount: e.target.value })
            }
          />
        </div>

        {/* BANNER */}
        <div className="form_group">
          <label>Banner Image (Optional)</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={async (e) => {
              if (!e.target.files[0]) return;
              const base64 = await toBase64(e.target.files[0]);
              setForm({ ...form, banner: base64 });
            }}
          />
        </div>

        {/* CITY SECTION */}
        <div className="location_section">
          <div className="location_header">
            <h4>Select Cities</h4>
          </div>

          <div className="city_grid">
            {cities.map((city, index) => (
              <div
                key={index}
                className={`city_chip ${
                  form.cities.includes(city) ? "selected" : ""
                }`}
                onClick={() => {
                  if (form.cities.includes(city)) {
                    setForm({
                      ...form,
                      cities: form.cities.filter((c) => c !== city),
                    });
                  } else {
                    setForm({
                      ...form,
                      cities: [...form.cities, city],
                    });
                  }
                }}
              >
                {city}
              </div>
            ))}
          </div>
        </div>

        {/* DATES */}
        <div className="date_row">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) =>
                setForm({ ...form, end_date: e.target.value })
              }
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="action_row">
          <button className="cancel_btn" onClick={resetForm}>
            Cancel
          </button>

          <button className="submit_btn" onClick={submit}>
            Submit Request
          </button>
        </div>

      </div>
    </div>
  );
};

export default SupplierPromotionRequest;