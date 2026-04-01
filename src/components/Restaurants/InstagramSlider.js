

import React from "react";
import { Link } from "react-router-dom";

/* IMAGE IMPORTS */
import insta1 from "../../images/instagram_img_1.jpg";
import insta2 from "../../images/instagram_img_2.jpg";
import insta3 from "../../images/instagram_img_3.jpg";
import insta4 from "../../images/instagram_img_4.jpg";
import insta5 from "../../images/instagram_img_5.jpg";
import insta6 from "../../images/instagram_img_6.jpg";

const InstagramSlider = () => {
  // 🔥 Image + productId mapping (MANDATORY for shopdetails/:productId)
  const instaImages = [
    { img: insta1, productId: 1 },
    { img: insta2, productId: 2 },
    { img: insta3, productId: 3 },
    { img: insta4, productId: 4 },
    { img: insta5, productId: 5 },
    { img: insta6, productId: 6 },
  ];

  return (
    <section className="instagram_photo mt-5 mb-5 pb-80">
      <div className="row insta_slider">

        {instaImages.map((item, index) => (
          <div
            className="col-xl-2 col-lg-3 col-md-4 col-sm-6"
            key={index}
          >
            <div className="instagram_photo_item wow fadeInUp">

              <img
                src={item.img}
                alt="instagram"
                className="img-fluid w-100"
              />

              {/* 🔥 Dashboard-safe navigation */}
              <Link
                to={`/restaurantdashboard/shopdetails/${item.productId}`}
                className="insta_overlay_link"
              >
                <i className="far fa-eye"></i>
                <span>
                  <i className="fa fa-shopping-basket"></i> View Product
                </span>
              </Link>

            </div>
          </div>
        ))}

      </div>
    </section>
  );
};

export default InstagramSlider;

                     