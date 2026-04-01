

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ------------ STATIC IMAGES (fallback) ------------ */
import p1 from "../../images/product_img_1.jpg";
import p2 from "../../images/product_img_2.jpg";
import p3 from "../../images/product_img_3.jpg";
import p4 from "../../images/product_img_4.jpg";
import p5 from "../../images/product_img_5.jpg";
import p6 from "../../images/product_img_6.jpg";
import p7 from "../../images/product_img_7.jpg";
import p8 from "../../images/product_img_8.jpg";

const STATIC_IMAGES = [p1, p2, p3, p4, p5, p6, p7, p8];

const NewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* TEMP restaurant_id */
  const restaurantId = 1;

  /* ------------ FETCH TRENDING PRODUCTS ------------ */
  useEffect(() => {
    fetch("http://localhost:3000/api/trending")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("TRENDING API ERROR:", err);
        setLoading(false);
      });
  }, []);

  /* ------------ ADD TO CART ------------ */
  const addToCart = async (product) => {
    try {
      const res = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          product_id: product.id,
          quantity: 1,
          price: product.price_numeric,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      if (window.confirm("Product added to cart 🛒\n\nGo to cart page?")) {
        navigate("/restaurantdashboard/cartview");
      }
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      alert("Server error");
    }
  };

  /* ------------ WISHLIST ------------ */
  const addToWishlist = (item) => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists = wishlist.find((p) => p.id === item.id);

    if (exists) {
      alert("Already in wishlist ❤️");
      navigate("/restaurantdashboard/wishlist");
      return;
    }

    wishlist.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.img || null,
    });

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    if (window.confirm("Added to wishlist ❤️\n\nGo to wishlist?")) {
      navigate("/restaurantdashboard/wishlist");
    }
  };

  /* ------------ VIEW PRODUCT ------------ */
  const viewProduct = (id) => {
    navigate(`/restaurantdashboard/shopdetails/${id}`);
  };

  return (
    <section className="trending_products bg1 pt-80 pb-80">
      <div className="container">
        {/* HEADING */}
        <div className="row">
          <div className="col-xl-6 m-auto text-center">
            <div className="section_heading mb-3">
              <h4 className="premium_badge text-white">Trending Now</h4>
              <h2 className="premium_title">
                Discover what people are loving today
              </h2>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="row mt-4">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            products.map((item, index) => (
              <div key={item.id} className="col-xl-2 col-lg-3 col-sm-6 mb-4">
                <div className="trending_card glow_card">
                  {/* IMAGE */}
                  <div className="trending_img sparkle_box">
                    <img
                      src={item.img || STATIC_IMAGES[index % 8]}
                      alt={item.name}
                    />

                    <span className={`trend_tag ${item.tag}`}>
                      {item.tag === "hot"
                        ? "Hot"
                        : item.tag === "new"
                        ? "New"
                        : "Sale"}
                    </span>

                    {/* ACTIONS */}
                    <div className="trend_actions">
                      <button onClick={() => addToCart(item)}>
                        <i className="fa fa-shopping-basket"></i>
                      </button>

                      <button onClick={() => viewProduct(item.id)}>
                        <i className="fa fa-eye"></i>
                      </button>

                      <button onClick={() => addToWishlist(item)}>
                        <i className="fa fa-heart"></i>
                      </button>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="trending_info">
                    <h4>{item.name}</h4>

                    <div className="trend_rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={
                            i < item.rating ? "fas fa-star" : "far fa-star"
                          }
                        />
                      ))}
                    </div>

                    <p className="price">{item.price}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
