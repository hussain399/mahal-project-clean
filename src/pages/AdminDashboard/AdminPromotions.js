import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Promotions.css";

const API = "http://127.0.0.1:5000/api/v1/admin/promotions/mahal";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminPromotions = () => {
  const [activeTab, setActiveTab] = useState("PRODUCT");

  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // const [suppliers, setSuppliers] = useState([]);
  // const [products, setProducts] = useState([]);
  // const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [, setSuppliers] = useState([]);
  const [, setProducts] = useState([]);
  const [, setSelectedSupplier] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [productSearchKeyword, setProductSearchKeyword] = useState("");
  const [categorySearchKeyword, setCategorySearchKeyword] = useState("");

  const [categoryResults, setCategoryResults] = useState([]);
  const [selectedCategorySuppliers, setSelectedCategorySuppliers] = useState([]);

  // Festival Advanced Selection
  const [festivalCategoryKeyword, setFestivalCategoryKeyword] = useState("");
  const [festivalCategories, setFestivalCategories] = useState([]);
  const [festivalSubcategories, setFestivalSubcategories] = useState([]);
  const [festivalProducts, setFestivalProducts] = useState([]);
  const [selectedFestivalProducts, setSelectedFestivalProducts] = useState([]);

  const searchProducts = async (value) => {
    setProductSearchKeyword(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/v1/admin/products/search?q=${value}`
      );

      setSearchResults(res.data.data);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    }
  };

  const searchCategory = async (value) => {
    setCategorySearchKeyword(value);

    if (!value.trim()) {
      setCategoryResults([]);
      return;
    }

    if (value.length < 2) {
      setCategoryResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/v1/admin/categories/search?q=${value}`
      );

      setCategoryResults(res.data.data || []);
    } catch (error) {
      console.error(error);
      setCategoryResults([]);
    }
  };
  
  /* ---------- PRODUCT ---------- */
  const [product, setProduct] = useState({
    product_id: "",
    product_ids: [], 
    supplier_ids: [], 
    cities: [],
    applyToAll: false,
    start_date: "",
    end_date: "",
    priority_level: "HIGH",
    banner: null,
    title: "",
    headline: "",
    description: "",
    offer_type: "",
    offer_value: "",
  });

  /* ---------- CATEGORY ---------- */
  const [category, setCategory] = useState({
    category_id: "",
    category_ids: [],
    supplier_ids: [], 
    cities: [],
    applyToAll: false,
    start_date: "",
    end_date: "",
    priority_level: "HIGH",
    banner: null,
    title: "",
    headline: "",
    description: "",
    offer_type: "",
    offer_value: "",
  });

  /* ---------- FESTIVAL ---------- */
  const [festival, setFestival] = useState({
    title: "",
    headline: "", 
    description: "",
    product_ids: [], 
    supplier_ids: [], 
    offer_type: "",
    offer_value: "",
    countries: [],
    applyToAll: false,
    start_date: "",
    end_date: "",
    priority_level: "HIGH",
    homepage_banners: [],
    category_banners: [],
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/v1/master/city")
      .then(res => setCities(res.data.data));

    axios.get("http://127.0.0.1:5000/api/v1/master/country")
      .then(res => setCountries(res.data.data));
  }, []);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/v1/admin/suppliers")
      .then(res => setSuppliers(res.data.data));
  }, []);

  const handleSupplierChange = (supplierId) => {
    setSelectedSupplier(supplierId);

    axios.get(`http://127.0.0.1:5000/api/v1/admin/supplier/${supplierId}/products`)
      .then(res => setProducts(res.data.data));
  };

  const resetForm = (skipConfirm = false) => {
    // if (!window.confirm("Are you sure you want to clear this form?")) return;

    if (!skipConfirm) {
      if (!window.confirm("Are you sure you want to clear this form?")) return;
    }
    // Clear search
    setProductSearchKeyword("");
    setCategorySearchKeyword("");
    setSearchResults([]);
    setCategoryResults([]);
    setSelectedProducts([]);
    setSelectedCategorySuppliers([]);

    // 🔥 FESTIVAL CLEAR
    setFestivalCategoryKeyword("");
    setFestivalCategories([]);
    setFestivalSubcategories([]);
    setFestivalProducts([]);
    setSelectedFestivalProducts([]);

    // Reset PRODUCT
    setProduct({
      product_id: "",
      product_ids: [],
      supplier_ids: [],
      cities: [],
      applyToAll: false,
      start_date: "",
      end_date: "",
      priority_level: "HIGH",
      banner: null,
      title: "",
      headline: "",
      description: "",
      offer_type: "",
      offer_value: "",
    });

    // Reset CATEGORY
    setCategory({
      category_id: "",
      category_ids: [],
      supplier_ids: [],
      cities: [],
      applyToAll: false,
      start_date: "",
      end_date: "",
      priority_level: "HIGH",
      banner: null,
      title: "",
      headline: "",
      description: "",
      offer_type: "",
      offer_value: "",
    });

    // Reset FESTIVAL
    setFestival({
      title: "",
      headline: "",
      description: "",
      product_ids: [], 
      supplier_ids: [], 
      offer_type: "",
      offer_value: "",
      countries: [],
      applyToAll: false,
      start_date: "",
      end_date: "",
      priority_level: "HIGH",
      homepage_banners: [],
      category_banners: [],
    });

    // Reset file input
    setFileInputKey(Date.now());
  };

  const submit = async () => {
    let payload = {
      target_type: activeTab,
    };

    if (activeTab === "PRODUCT" && product.product_ids.length === 0) {
      alert("Select at least one product");
      return;
    }

    if (activeTab === "PRODUCT") {

      const finalProductIds =
        product.product_ids?.length > 0
          ? product.product_ids
          : product.product_id
          ? [Number(product.product_id)]
          : [];

      if (finalProductIds.length === 0) {
        alert("Select at least one product");
        return;
      }

      payload = {
        ...payload,
        supplier_ids: product.supplier_ids,
        target_ids: finalProductIds,
        location_scope: product.applyToAll ? "ALL" : "CITY",
        location_values: product.applyToAll ? cities : product.cities,
        start_date: product.start_date,
        end_date: product.end_date,
        priority_level: product.priority_level,
        banner_image: product.banner,
        title: product.title,
        headline: product.headline,
        description: product.description,
        offer_type: product.offer_type,
        offer_value: product.offer_value,
        meta: {
            product_count: finalProductIds.length,
            supplier_count: product.supplier_ids.length
        }
      };
    }

    if (activeTab === "CATEGORY") {

      if (selectedCategorySuppliers.length === 0) {
        alert("Select at least one category supplier");
        return;
      }

      payload = {
        ...payload,
        supplier_ids: [
          ...new Set(
            selectedCategorySuppliers.map(item => item.supplier_id)
          )
        ],
        target_ids: [
          ...new Set(
            selectedCategorySuppliers.map(item => item.category_id)
          )
        ],
        location_scope: category.applyToAll ? "ALL" : "CITY",
        location_values: category.applyToAll ? cities : category.cities,
        start_date: category.start_date,
        end_date: category.end_date,
        priority_level: category.priority_level,
        banner_image: category.banner,
        title: category.title,
        headline: category.headline,
        description: category.description,
        offer_type: category.offer_type,
        offer_value: category.offer_value,
        meta: {
          category_supplier_count: selectedCategorySuppliers.length
        }
      };
    }

    if (activeTab === "FESTIVAL") {

      if (selectedFestivalProducts.length === 0) {
        alert("Select at least one product");
        return;
      }

      payload = {
        ...payload,
        supplier_ids: [
          ...new Set(selectedFestivalProducts.map(p => p.supplier_id))
        ],
        target_ids: selectedFestivalProducts.map(p => p.product_id),
        location_scope: festival.applyToAll ? "ALL" : "COUNTRY",
        location_values: festival.applyToAll ? countries : festival.countries,
        start_date: festival.start_date,
        end_date: festival.end_date,
        priority_level: festival.priority_level,
        title: festival.title,
        headline: festival.headline,
        description: festival.description,
        offer_type: festival.offer_type,
        offer_value: festival.offer_value,
        meta: {
          homepage_banners: festival.homepage_banners,
          category_banners: festival.category_banners,
          category_ids: [
            ...new Set(selectedFestivalProducts.map(p => p.category_id))
          ],
          sub_category_ids: [
            ...new Set(selectedFestivalProducts.map(p => p.sub_category_id))
          ]
        }
      };
    }

    try {
      const token = localStorage.getItem("admin_token");

      await axios.post(API, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Promotion Created Successfully");

      resetForm(true); 
    } catch (error) {
      console.error(error);
      alert("Failed to create promotion");
    }
  };

  return (
    <div className="promotions_page">

      {/* HEADER */}
      <div className="page_header">
        <h2>Promotions & Offers</h2>
      </div>

      {/* TAB SWITCH */}
      <div className="offer_tabs">
        <button onClick={() => setActiveTab("PRODUCT")}
          className={activeTab === "PRODUCT" ? "active" : ""}>
          Product Offer
        </button>
        <button onClick={() => setActiveTab("CATEGORY")}
          className={activeTab === "CATEGORY" ? "active" : ""}>
          Category Offer
        </button>
        <button onClick={() => setActiveTab("FESTIVAL")}
          className={activeTab === "FESTIVAL" ? "active" : ""}>
          Festival Sale
        </button>
      </div>

      {/* CARD */}
      <div className="offer_card">

        {/* PRODUCT OFFER */}
        {activeTab === "PRODUCT" && (
          <>
            <h3>Create Product Offer</h3>

            {/* <div className="form_group">
              <label>Select Supplier</label>
              <select
                value={selectedSupplier || ""}
                onChange={(e) => handleSupplierChange(e.target.value)}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    {s.company_name_english}
                  </option>
                ))}
              </select>
            </div> */}

            {/* <div className="form_group">
              <label>Select Product</label>
              <select
                value={product.product_id || ""}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    product_id: e.target.value,
                    product_ids: [],
                    supplier_id: selectedSupplier
                  })
                }
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_name_english}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="form_group">
              <label>Select Product</label>
              <input
                type="text"
                placeholder="Search Product Name..."
                value={productSearchKeyword}
                onChange={(e) => searchProducts(e.target.value)}
              />
            </div>

            {productSearchKeyword.trim() !== "" && searchResults.length > 0 && (
              <div className="search_results">

                {searchResults.map((p) => {
                  const isSelected = product.product_ids.includes(p.product_id);

                  return (
                    <div
                      key={p.product_id}
                      className={`result_item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        const alreadySelected = product.product_ids.includes(p.product_id);

                        if (alreadySelected) {
                          setProduct({
                            ...product,
                            product_ids: product.product_ids.filter(id => id !== p.product_id),
                            supplier_ids: product.supplier_ids.filter(id => id !== p.supplier_id)
                          });

                          setSelectedProducts(prev =>
                            prev.filter(item => item.product_id !== p.product_id)
                          );

                        } else {
                          setProduct({
                            ...product,
                            product_ids: [...product.product_ids, p.product_id],
                            supplier_ids: [
                              ...new Set([...product.supplier_ids, p.supplier_id])
                            ]
                          });

                          setSelectedProducts(prev => [...prev, p]);
                        }
                      }}
                    >
                      {/* {p.product_name_english} */}
                      <div className="product_result_content">
                        <div className="product_name">
                          {p.product_name_english} (ID: {p.product_id})
                        </div>
                        <div className="product_supplier">
                          Supplier: {p.company_name_english} (ID: {p.supplier_id})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedProducts.length > 0 && (
              <div className="selected_products_section">
                <h4>Selected Products</h4>
                <div className="selected_products_list">
                  {selectedProducts.map((p) => (
                    <div key={p.product_id} className="selected_product_chip">
                      {/* {p.product_name_english} */}
                      <div className="product_result_content">
                        <div className="product_name">
                          {p.product_name_english} (ID: {p.product_id})
                        </div>
                        <div className="product_supplier">
                          Supplier: {p.company_name_english} (ID: {p.supplier_id})
                        </div>
                      </div>
                      <span
                        onClick={() => {
                          setProduct({
                            ...product,
                            product_ids: product.product_ids.filter(
                              id => id !== p.product_id
                            ),
                            supplier_ids: product.supplier_ids.filter(
                              id => id !== p.supplier_id
                            )
                          });

                          setSelectedProducts(prev =>
                            prev.filter(item => item.product_id !== p.product_id)
                          );
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form_group">
              <label>Title</label>
              <input
                value={product.title}
                placeholder="Enter Promotion Title"
                onChange={(e) =>
                  setProduct({ ...product, title: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Headline</label>
              <input
                value={product.headline}
                placeholder="Enter Headline"
                onChange={(e) =>
                  setProduct({ ...product, headline: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Description</label>
              <textarea
                value={product.description}
                placeholder="Enter Description"
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Offer Type</label>
              <select
                value={product.offer_type}
                onChange={(e) =>
                  setProduct({ ...product, offer_type: e.target.value })
                }
              >
                <option value="">Select Offer Type</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount</option>
              </select>
            </div>

            <div className="form_group">   
              <label>Offer Value</label>
              <input
                type="number"
                value={product.offer_value}
                placeholder="Enter offer value"
                onChange={(e) =>
                  setProduct({ ...product, offer_value: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Banner Image (Optional)</label>
              <input
                key={fileInputKey}
                type="file"
                onChange={async (e) => {
                  const base64 = await toBase64(e.target.files[0]);
                  setProduct({ ...product, banner: base64 });
                }}
              />
            </div>

            <div className="form_group">
              <label>Priority Level</label>
              <select
                value={product.priority_level}
                onChange={(e) =>
                  setProduct({ ...product, priority_level: e.target.value })
                }
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="location_section">
              <div className="location_header">
                <h4>Select Cities</h4>

                <div className="scope_toggle">
                  <button
                    type="button"
                    className={!product.applyToAll ? "active" : ""}
                    onClick={() =>
                      setProduct({ ...product, applyToAll: false })
                    }
                  >
                    Selected Cities
                  </button>

                  <button
                    type="button"
                    className={product.applyToAll ? "active" : ""}
                    onClick={() =>
                      setProduct({ ...product, applyToAll: true })
                    }
                  >
                    All Cities
                  </button>
                </div>
              </div>

              {!product.applyToAll && (
                <div className="city_grid">
                  {cities.map((city, index) => (
                    <div
                      key={index}
                      className={`city_chip ${
                        product.cities.includes(city) ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (product.cities.includes(city)) {
                          setProduct({
                            ...product,
                            cities: product.cities.filter(c => c !== city),
                          });
                        } else {
                          setProduct({
                            ...product,
                            cities: [...product.cities, city],
                          });
                        }
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* CATEGORY OFFER */}
        {activeTab === "CATEGORY" && (
          <>
            <h3>Create Category Offer</h3>

            <div className="form_group">
              <label>Search Category</label>
              <input
                type="text"
                placeholder="Search Category..."
                value={categorySearchKeyword}
                onChange={(e) => searchCategory(e.target.value)}
              />
            </div>

            {Array.isArray(categoryResults) &&
              categoryResults.map(cat => {

                return (
                  <div key={cat.category_id} className="category_block">

                    <h4 className="category_title">{cat.category_name}</h4>

                    <div className="category_suppliers_grid">
                      {cat.suppliers.map((supplierName, i) => {

                        const supplierId = cat.supplier_ids[i];

                        const isSelected = selectedCategorySuppliers.some(
                          item =>
                            item.category_id === cat.category_id &&
                            item.supplier_id === supplierId
                        );

                        return (
                          <div
                            key={supplierId}
                            className={`result_item ${isSelected ? "selected" : ""}`}
                            onClick={() => {

                              if (isSelected) {
                                setSelectedCategorySuppliers(prev =>
                                  prev.filter(item =>
                                    !(
                                      item.category_id === cat.category_id &&
                                      item.supplier_id === supplierId
                                    )
                                  )
                                );
                              } else {
                                setSelectedCategorySuppliers(prev => [
                                  ...prev,
                                  {
                                    category_id: cat.category_id,
                                    category_name: cat.category_name,
                                    supplier_id: supplierId,
                                    supplier_name: supplierName
                                  }
                                ]);
                              }
                            }}
                          >
                            <div className="product_result_content">
                              <div className="product_name">
                                {cat.category_name} (ID: {cat.category_id})
                              </div>
                              <div className="product_supplier">
                                Supplier: {supplierName} (ID: {supplierId})
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            }
            
            <div className="selected_products_section">
              <h4>Selected Category Suppliers</h4>
              <div className="selected_products_list">

                {selectedCategorySuppliers.map((item, index) => (
                  <div key={index} className="selected_product_chip">

                    <div className="product_result_content">
                      <div className="product_name">
                        {item.category_name} (ID: {item.category_id})
                      </div>
                      <div className="product_supplier">
                        Supplier: {item.supplier_name} (ID: {item.supplier_id})
                      </div>
                    </div>

                    <span
                      onClick={() => {
                        setSelectedCategorySuppliers(prev =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      ✕
                    </span>

                  </div>
                ))}

              </div>
            </div>

            <div className="form_group">
              <label>Title</label>
              <input
                value={category.title}
                placeholder="Enter Promotion Title"
                onChange={(e) =>
                  setCategory({ ...category, title: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Headline</label>
              <input
                value={category.headline}
                placeholder="Enter Headline"
                onChange={(e) =>
                  setCategory({ ...category, headline: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Description</label>
              <textarea
                value={category.description}
                placeholder="Enter Description"
                onChange={(e) =>
                  setCategory({ ...category, description: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Offer Type</label>
              <select
                value={category.offer_type}
                onChange={(e) =>
                  setCategory({ ...category, offer_type: e.target.value })
                }
              >
                <option value="">Select Offer Type</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount</option>
              </select>
            </div>

            <div className="form_group">
              <label>Offer Value</label>
              <input
                type="number"
                value={category.offer_value}
                placeholder="Enter offer value"
                onChange={(e) =>
                  setCategory({ ...category, offer_value: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Banner Image (Optional)</label>
              <input
                key={fileInputKey}
                type="file"
                onChange={async (e) => {
                  const base64 = await toBase64(e.target.files[0]);
                  setCategory({ ...category, banner: base64 });
                }}
              />
            </div>

            <div className="form_group">
              <label>Priority Level</label>
              <select
                value={category.priority_level}
                onChange={(e) =>
                  setCategory({ ...category, priority_level: e.target.value })
                }
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="location_section">
              <div className="location_header">
                <h4>Select Cities</h4>

                <div className="scope_toggle">
                  <button
                    type="button"
                    className={!category.applyToAll ? "active" : ""}
                    onClick={() =>
                      setCategory({ ...category, applyToAll: false })
                    }
                  >
                    Selected Cities
                  </button>

                  <button
                    type="button"
                    className={category.applyToAll ? "active" : ""}
                    onClick={() =>
                      setCategory({ ...category, applyToAll: true })
                    }
                  >
                    All Cities
                  </button>
                </div>
              </div>

              {!category.applyToAll && (
                <div className="city_grid">
                  {cities.map((city, index) => (
                    <div
                      key={index}
                      className={`city_chip ${
                        category.cities.includes(city) ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (category.cities.includes(city)) {
                          setCategory({
                            ...category,
                            cities: category.cities.filter(c => c !== city),
                          });
                        } else {
                          setCategory({
                            ...category,
                            cities: [...category.cities, city],
                          });
                        }
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* FESTIVAL SALE */}
        {activeTab === "FESTIVAL" && (
          <>
            <h3>Launch Festival Sale</h3>

            <div className="form_group">
              <label>Festival Title</label>
              <input
                placeholder="Eid Al-Fitr Special Discounts"
                onChange={(e) =>
                  setFestival({ ...festival, title: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Headline</label>
              <input
                value={festival.headline}
                onChange={(e) =>
                  setFestival({ ...festival, headline: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Description</label>
              <textarea
                placeholder="Festival description..."
                onChange={(e) =>
                  setFestival({ ...festival, description: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Search Category</label>
              <input
                type="text"
                placeholder="Search Category..."
                value={festivalCategoryKeyword}
                onChange={async (e) => {
                  const value = e.target.value;
                  setFestivalCategoryKeyword(value);

                  if (!value.trim()) {
                    setFestivalCategories([]);
                    setFestivalSubcategories([]);
                    setFestivalProducts([]);
                    return;
                  }

                  const res = await axios.get(
                    `http://127.0.0.1:5000/api/v1/admin/categories/search?q=${value}`
                  );

                  setFestivalCategories(res.data.data || []);
                }}
              />
            </div>

            {festivalCategories.map(cat => (
              <div
                key={cat.category_id}
                className="result_item"
                onClick={async () => {
                  const res = await axios.get(
                    `http://127.0.0.1:5000/api/v1/admin/subcategories/${cat.category_id}`
                  );

                  setFestivalSubcategories(res.data.data || []);
                  setFestivalProducts([]);
                }}
              >
                {cat.category_name}
              </div>
            ))}

            {festivalSubcategories.length > 0 && (
              <div className="form_group">
                <label>Select Subcategory</label>
                <select
                  onChange={async (e) => {
                    const subId = e.target.value;

                    const res = await axios.get(
                      `http://127.0.0.1:5000/api/v1/admin/subcategory/${subId}/products`
                    );

                    setFestivalProducts(res.data.data || []);
                  }}
                >
                  <option value="">Select Subcategory</option>
                  {festivalSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {festivalProducts.length > 0 && (
              <div className="search_results">
                {festivalProducts.map(p => {

                  const isSelected = selectedFestivalProducts.some(
                    item => item.product_id === p.product_id
                  );

                  return (
                    <div
                      key={p.product_id}
                      className={`result_item ${isSelected ? "selected" : ""}`}
                      onClick={() => {

                        if (isSelected) {
                          setSelectedFestivalProducts(prev =>
                            prev.filter(item => item.product_id !== p.product_id)
                          );
                        } else {
                          setSelectedFestivalProducts(prev => [...prev, p]);
                        }

                      }}
                    >
                      <div className="product_result_content">
                        <div className="product_name">
                          {p.product_name_english} (ID: {p.product_id})
                        </div>

                        <div className="product_supplier">
                          Category: {p.category_name} (ID: {p.category_id})
                        </div>

                        <div className="product_supplier">
                          Subcategory: {p.subcategory_name} (ID: {p.sub_category_id})
                        </div>

                        <div className="product_supplier">
                          Supplier: {p.company_name_english} (ID: {p.supplier_id})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedFestivalProducts.length > 0 && (
              <div className="selected_products_section">
                <h4>Selected Festival Products</h4>

                <div className="selected_products_list">
                  {selectedFestivalProducts.map((p, index) => (
                    <div key={index} className="selected_product_chip">

                      <div className="product_result_content">
                        <div className="product_name">
                          {p.product_name_english} (ID: {p.product_id})
                        </div>
                        <div className="product_supplier">
                          {p.category_name} / {p.subcategory_name}
                        </div>
                        <div className="product_supplier">
                          Supplier: {p.company_name_english} (ID: {p.supplier_id})
                        </div>
                      </div>

                      <span
                        onClick={() => {
                          setSelectedFestivalProducts(prev =>
                            prev.filter(item => item.product_id !== p.product_id)
                          );
                        }}
                      >
                        ✕
                      </span>

                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form_group">
              <label>Offer Type</label>
              <select
                value={festival.offer_type}
                onChange={(e) =>
                  setFestival({ ...festival, offer_type: e.target.value })
                }
              >
                <option value="">Select Offer Type</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount</option>
              </select>
            </div>

            <div className="form_group">
              <label>Offer Value</label>
              <input
                type="number"
                value={festival.offer_value}
                onChange={(e) =>
                  setFestival({ ...festival, offer_value: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>Priority Level</label>
              <select
                value={festival.priority_level}
                onChange={(e) =>
                  setFestival({ ...festival, priority_level: e.target.value })
                }
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="form_group">
              <label>Homepage Banners</label>
              <input
                key={fileInputKey}
                type="file"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files);

                  const base64Files = await Promise.all(
                    files.map(file => toBase64(file))
                  );

                  setFestival({
                    ...festival,
                    homepage_banners: base64Files
                  });
                }}
              />
            </div>

            <div className="form_group">
              <label>Category Banners (Optional)</label>
              <input
                key={fileInputKey}
                type="file"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files);

                  const base64Files = await Promise.all(
                    files.map(file => toBase64(file))
                  );

                  setFestival({
                    ...festival,
                    category_banners: base64Files
                  });
                }}
              />
            </div>

            <div className="location_section">
              <div className="location_header">
                <h4>Select Countries</h4>

                <div className="scope_toggle">
                  <button
                    type="button"
                    className={!festival.applyToAll ? "active" : ""}
                    onClick={() =>
                      setFestival({ ...festival, applyToAll: false })
                    }
                  >
                    Selected Countries
                  </button>

                  <button
                    type="button"
                    className={festival.applyToAll ? "active" : ""}
                    onClick={() =>
                      setFestival({ ...festival, applyToAll: true })
                    }
                  >
                    All Countries
                  </button>
                </div>
              </div>

              {!festival.applyToAll && (
                <div className="city_grid">
                  {countries.map((country, index) => (
                    <div
                      key={index}
                      className={`city_chip ${
                        festival.countries.includes(country) ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (festival.countries.includes(country)) {
                          setFestival({
                            ...festival,
                            countries: festival.countries.filter(c => c !== country),
                          });
                        } else {
                          setFestival({
                            ...festival,
                            countries: [...festival.countries, country],
                          });
                        }
                      }}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="date_row">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={
                activeTab === "PRODUCT"
                  ? product.start_date
                  : activeTab === "CATEGORY"
                  ? category.start_date
                  : festival.start_date
              }
              onChange={(e) => {
                if (activeTab === "PRODUCT") {
                  setProduct({ ...product, start_date: e.target.value });
                }
                if (activeTab === "CATEGORY") {
                  setCategory({ ...category, start_date: e.target.value });
                }
                if (activeTab === "FESTIVAL") {
                  setFestival({ ...festival, start_date: e.target.value });
                }
              }}
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={
                activeTab === "PRODUCT"
                  ? product.end_date
                  : activeTab === "CATEGORY"
                  ? category.end_date
                  : festival.end_date
              }
              onChange={(e) => {
                if (activeTab === "PRODUCT") {
                  setProduct({ ...product, end_date: e.target.value });
                }
                if (activeTab === "CATEGORY") {
                  setCategory({ ...category, end_date: e.target.value });
                }
                if (activeTab === "FESTIVAL") {
                  setFestival({ ...festival, end_date: e.target.value });
                }
              }}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="action_row">
          <button className="cancel_btn" onClick={resetForm}>Cancel</button>
          <button className="submit_btn" onClick={submit}>
            {activeTab === "FESTIVAL" ? "Launch Sale" : "Create Offer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPromotions;