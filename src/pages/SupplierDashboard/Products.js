import React, { useEffect, useState } from "react";
import axios from "axios";

import InventoryCard from "./InventoryCard";
import ProductActionsModal from "./ProductActionsModal";
import EditInventoryModal from "./EditInventoryModal";
import DeactivateModal from "./DeactivateModal";
import OfferModal from "./OfferModal";
const LOW_STOCK_LIMIT = 10;
const formatProduct = (p) => {
  const stock = p.stock_availability ?? 0;

  const stockStatus =
    stock === 0
      ? "OUT_OF_STOCK"
      : stock <= LOW_STOCK_LIMIT
      ? "LOW_STOCK"
      : "IN_STOCK";

  const expiryStatus =
    p.expiry_date && new Date(p.expiry_date) < new Date()
      ? "EXPIRED"
      : "VALID";

  return {
    id: p.product_id,
    name: p.product_name_english || "",
    image: p.product_images?.[0] || "",
    price: p.price_per_unit ?? 0,
    expiry: p.expiry_date || "",
    moq: p.minimum_order_quantity ?? 0,
    uom: p.unit_of_measure || "",
    currency: p.currency || "",
    units: stock,
    stockStatus,
    expiryStatus,
    __raw: p,
  };
};

const Products = () => {
  const supplierId = localStorage.getItem("linked_id");
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deactivateProduct, setDeactivateProduct] = useState(null);
  const [offerProduct, setOfferProduct] = useState(null);
  // const handleEditOffer = (product) => {
  //   setOfferProduct(product);
  //   setSelectedProduct(null);
  // };
  const [existingOffer, setExistingOffer] = useState(null);



    /* ===== SEARCH & FILTER STATES ===== */
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [offerFilter, setOfferFilter] = useState("");


   /* FILTERED ACTIVE */
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStock =
      stockFilter === "" || p.stockStatus === stockFilter;

    const matchesExpiry =
      expiryFilter === "" || p.expiryStatus === expiryFilter;

    const matchesOffer =
      offerFilter === "" ||
      (offerFilter === "NO_OFFER" && !p.offer) ||
      (p.offer && p.offer.offer_type === offerFilter);

    return (
      matchesSearch &&
      matchesStock &&
      matchesExpiry &&
      matchesOffer
    );
  });


  /* FILTERED ARCHIVED */
  const filteredArchived = archivedProducts.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStock = stockFilter === "" || p.stockStatus === stockFilter;
    const matchesExpiry = expiryFilter === "" || p.expiryStatus === expiryFilter;
    return matchesSearch && matchesStock && matchesExpiry;
  });

const fetchOfferByProduct = async (productId) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:5000/api/offers/by-product/${productId}`
    );
    return res.data; // null OR offer object
  } catch (err) {
    console.error("Offer fetch failed for product", productId);
    return null;
  }
};

  /* =========================
     LOAD INVENTORY
  ========================= */
  const loadInventory = async () => {
    if (!supplierId) return;

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/products/inventory?supplier_id=${supplierId}`
      );

      const formatted = await Promise.all(
  (res.data || []).map(async (p) => {
    const stock = p.stock_availability ?? 0;

    const stockStatus =
      stock === 0
        ? "OUT_OF_STOCK"
        : stock <= LOW_STOCK_LIMIT
        ? "LOW_STOCK"
        : "IN_STOCK";

    const expiryStatus =
      p.expiry_date && new Date(p.expiry_date) < new Date()
        ? "EXPIRED"
        : "VALID";

    // 🔥 FETCH OFFER PER PRODUCT
    const offer = await fetchOfferByProduct(p.product_id);

    return {
      id: p.product_id,
      name: p.product_name_english,
      image: p.product_images?.[0],
      price: p.price_per_unit,
      expiry_date: p.expiry_date,
      expiry_time: p.expiry_time,
      moq: p.minimum_order_quantity,
      uom: p.unit_of_measure,
      currency: p.currency,
      units: stock,
      stockStatus,
      expiryStatus,

      // ✅ THIS IS WHAT InventoryCard USES
      offer,

      __raw: p,
    };
  })
);


      setProducts(formatted);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  };

// const loadInventory = async () => {
//   if (!supplierId) return;

//   try {
//     const res = await axios.get(
//       `http://127.0.0.1:5000/api/products/inventory?supplier_id=${supplierId}`
//     );

//     const formatted = (res.data || []).map((p) => {
//       const stock = p.stock_availability ?? 0;

//       const stockStatus =
//         stock === 0
//           ? "OUT_OF_STOCK"
//           : stock <= LOW_STOCK_LIMIT
//           ? "LOW_STOCK"
//           : "IN_STOCK";

//       const expiryStatus =
//         p.expiry_date && new Date(p.expiry_date) < new Date()
//           ? "EXPIRED"
//           : "VALID";

//       return {
//         id: p.product_id,
//         name: p.product_name_english,
//         image: p.product_images?.[0],
//         price: p.price_per_unit,
//         expiry_date: p.expiry_date,
//         expiry_time: p.expiry_time,
//         moq: p.minimum_order_quantity,
//         uom: p.unit_of_measure,
//         currency: p.currency,
//         units: stock,
//         stockStatus,
//         expiryStatus,

//         // 🔥 NOW OFFER COMES DIRECTLY FROM JOIN
//         offer: p.offer,

//         __raw: p,
//       };
//     });

//     setProducts(formatted);
//   } catch (err) {
//     console.error("Failed to load inventory", err);
//   }
// };

  useEffect(() => {
    loadInventory();
  }, [supplierId]);

  /* =========================
     SAVE EDIT (✅ FIXED)
  ========================= */
 const handleSaveEdit = async (data) => {
  try {
    // 1️⃣ Update inventory fields
    await axios.put(
      "http://127.0.0.1:5000/api/products/update-inventory",
      {
        product_id: data.product_id,
        stock: Number(data.units),
        price_per_unit: Number(data.price),
        minimum_order_quantity: Number(data.moq),
        currency: data.currency,
        unit_of_measure: data.uom,

        // ✅ FIXED
        expiry_date: data.expiry_date || null,
        expiry_time: data.expiry_time || null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2️⃣ Upload images (if any)
    if (data.images?.length) {
      const formData = new FormData();

      data.images.forEach((file) => {
        formData.append("images", file);
      });

      await axios.post(
        `http://127.0.0.1:5000/api/products/upload-images/${data.product_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    // 3️⃣ Refresh UI AFTER everything is done
    setEditProduct(null);
    await loadInventory();

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to update inventory or images");
  }
};




  /* =========================
     DEACTIVATE PRODUCT
  ========================= */
  const handleDeactivate = async (productId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/products/${productId}/delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDeactivateProduct(null);
      await loadInventory();
    } catch (err) {
      alert("Failed to deactivate product");
    }
  };
  const loadArchivedProducts = async () => {
  if (!supplierId) return;

  try {
    const res = await axios.get(
      `http://127.0.0.1:5000/api/products/inventory?flag=D&supplier_id=${supplierId}`
    );

    const formatted = (res.data || []).map(formatProduct);
    setArchivedProducts(formatted);
  } catch (err) {
    console.error("Failed to load archived products", err);
  }
};

  const handleRestore = async (productId) => {
  try {
    await axios.put(
      `http://127.0.0.1:5000/api/products/${productId}/restore`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await loadInventory();
    await loadArchivedProducts();
  } catch (err) {
    alert("Failed to restore product");
  }
};
const handleSaveOffer = async (offerData) => {
  if (!offerData.product_id) {
    alert("Product ID missing");
    return;
  }

  try {
    const payload = {
      supplier_id: supplierId,
      title: offerData.title,
      description: offerData.description,
      offer_type: offerData.offer_type,
      discount_percentage: offerData.discount_percentage || "",
      flat_amount: offerData.flat_amount || "",
      buy_quantity: offerData.buy_quantity || "",
      get_quantity: offerData.get_quantity || "",
      start_date: offerData.start_date,
      end_date: offerData.end_date,
      start_time: offerData.start_time || null,
      end_time: offerData.end_time || null,
      is_active: offerData.is_active 
    };

    const existing = await axios.get(
      `http://127.0.0.1:5000/api/offers/by-product/${offerData.product_id}`
    );

    if (existing.data?.offer_id) {
      // ✅ UPDATE
      await axios.put(
        `http://127.0.0.1:5000/api/offers/by-product/${offerData.product_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // ✅ CREATE (NEW ROUTE)
      await axios.post(
        `http://127.0.0.1:5000/api/offers/by-product/${offerData.product_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setOfferProduct(null);
    setExistingOffer(null);
    await loadInventory();

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to save offer");
  }
};


const handleEditOffer = async (product) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:5000/api/offers/by-product/${product.product_id}`
    );

    setExistingOffer(res.data); // may be null
    setOfferProduct(product);
    setSelectedProduct(null);

  } catch (err) {
    console.error("Failed to fetch offer", err);
    setExistingOffer(null);
    setOfferProduct(product);
    setSelectedProduct(null);
  }
};

  /* =========================
     RENDER
  ========================= */
    return (
    <div className="inventory_page">

      {/* SEARCH ICON + FIELD */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        {!showSearch && (
          <button
            onClick={() => setShowSearch(true)}
           
          >
            🔍
          </button>
        )}

        {showSearch && (
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearch("");
              }}
             
            >
              ❌
            </button>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          
        >
          <option value="">Stock</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>

        <select
          value={expiryFilter}
          onChange={(e) => setExpiryFilter(e.target.value)}
          
        >
          <option value="">Expiry</option>
          <option value="VALID">Valid</option>
          <option value="EXPIRED">Expired</option>
        </select>

        <select
          value={offerFilter}
          onChange={(e) => setOfferFilter(e.target.value)}
        >
          <option value="">Offer</option>
          <option value="Percentage">Percentage</option>
          <option value="Flat">Flat</option>
          <option value="BOGO">BOGO</option>
          <option value="NO_OFFER">No Offer</option>
        </select>


        {(stockFilter || expiryFilter || search) && (
          <button
            onClick={() => {
              setSearch("");
              setStockFilter("");
              setExpiryFilter("");
              setOfferFilter("");
            }}
          
          >
            Reset
          </button>
        )}
      </div>

      <button
        onClick={async () => {
          if (!showArchived) await loadArchivedProducts();
          setShowArchived(!showArchived);
        }}
        
      >
        {showArchived ? "⬅️ Hide InActive Products" : "🗄️ View InActive Products"}
      </button>

      {/* ACTIVE LIST */}
      {!showArchived && (
        <div className="inventory_list">
          {filteredProducts.map((p) => (
            <InventoryCard
              key={p.id}
              product={p}
              onClick={() => setSelectedProduct(p.__raw)}
            />
          ))}
        </div>
      )}

      {/* ARCHIVED LIST */}
      {showArchived && filteredArchived.length > 0 && (
        <div className="inventory_list archived">
          {filteredArchived.map((p) => (
            <div key={p.id} className="archived_card">
              <InventoryCard product={p} disabled />
              <button onClick={() => handleRestore(p.id)} className="btn restore">
                ♻️ Restore
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {selectedProduct && (
        <ProductActionsModal
          product={{
            product_id: selectedProduct.product_id,
            name: selectedProduct.product_name_english
          }}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => {
            setEditProduct(selectedProduct);
            setSelectedProduct(null);
          }}
          onDeactivate={() => {
            setDeactivateProduct(selectedProduct);
            setSelectedProduct(null);
          }}
          onEditOffer={handleEditOffer}
        />
      )}

      {editProduct && (
        <EditInventoryModal
          product={{
            product_id: editProduct.product_id,
            name: editProduct.product_name_english,
            price: editProduct.price_per_unit,
            expiry_date: editProduct.expiry_date,
            expiry_time: editProduct.expiry_time,
            moq: editProduct.minimum_order_quantity,
            uom: editProduct.unit_of_measure,
            currency: editProduct.currency,
            units: editProduct.stock_availability,
            images: editProduct.product_images || [],
          }}
          onClose={() => setEditProduct(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deactivateProduct && (
        <DeactivateModal
          product={{ name: deactivateProduct.product_name_english }}
          onClose={() => setDeactivateProduct(null)}
          onConfirm={() => handleDeactivate(deactivateProduct.product_id)}
        />
      )}

      {offerProduct && (
        <OfferModal
          product={offerProduct}
          offer={existingOffer}   // 🔥 PASS OFFER
          onClose={() => {
            setOfferProduct(null);
            setExistingOffer(null);
          }}
          onSave={handleSaveOffer}
        />
      )}

    </div>
  );
};

export default Products;