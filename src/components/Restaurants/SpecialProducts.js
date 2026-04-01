import React from "react";

/* IMAGE IMPORTS */
import bannerImg from "../../images/special_pro_banner_img.jpg";
import sp1 from "../../images/special_product_1.jpg";
import sp2 from "../../images/special_product_2.jpg";
import sp3 from "../../images/special_product_3.jpg";
import sp4 from "../../images/special_product_4.jpg";
import sp5 from "../../images/special_product_5.jpg";
import sp6 from "../../images/special_product_6.jpg";

const SpecialProducts = () => {
  return (
    <section className="special_product pt_95 xs_pt_75 ">
      <div className="container">

        <div className="row wow fadeInUp">
          <div className="col-xl-5 m-auto">
            <div className="section_heading mb_25 mb-5">
              <h4>Special Products</h4>
              <h2>Our Special Products</h2>
            </div>
          </div>
        </div>

        <div className="row">

          {/* LEFT BANNER */}
          <div className="col-xxl-4 col-lg-3 col-xl-3">
            <div className="special_product_banner wow fadeInLeft">
              <img
                src={bannerImg}
                alt="special product"
                className="img-fluid w-100"
              />
              <div className="text">
                <h5>Weekly Discounts on</h5>
                <h3>Fruits and Vegetables</h3>
                <p>
                  It is a long established fact that a reader
                  acted by the readable content.
                </p>
                <a className="common_btn black_btn" href="#">
                  shop now <i className="fas fa-long-arrow-right"></i>
                  <span></span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT PRODUCTS */}
          <div className="col-xxl-8 col-lg-9 col-xl-9">
            <div className="row">

              {[
                { img: sp1, title: "Butter garlic crab", price: "10.00", old: "12.00", discount: "save 70%" },
                { img: sp2, title: "Bengal Meat Bone", price: "13.00", old: "15.00" },
                { img: sp3, title: "Three Carrot", price: "17.00", old: "20.00", discount: "save 40%" },
                { img: sp4, title: "Lemon Meat Bone", price: "29.00", old: "32.00", discount: "save 50%" },
                { img: sp5, title: "Orange Slice Mix", price: "20.00", old: "22.00" },
                { img: sp6, title: "Carrot Vegetables", price: "16.00", old: "18.00", discount: "save 30%" },
              ].map((item, index) => (
                <div className="col-md-6" key={index}>
                  <div className="special_product_item wow fadeInUp">
                    <div className="special_product_img">
                      <img
                        src={item.img}
                        alt="product"
                        className="img-fluid w-100"
                      />
                      {item.discount && (
                        <span className="discount">{item.discount}</span>
                      )}
                    </div>

                    <div className="special_product_text">
                      <a className="title" href="#">
                        {item.title}
                      </a>
                      <span>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star-half-alt"></i>
                        <i className="far fa-star"></i>
                      </span>
                      <p>
                        ${item.price} <del>${item.old}</del>
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SpecialProducts;
