import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

/* -------- IMAGES -------- */
import slider1 from "../../images/small_poster1.jpg";
import slider2 from "../../images/small_poster2.jpg";
import slider3 from "../../images/small_poster3.jpg";

import bannerAdd1 from "../../images/banner_3_add_bg_1.jpg";
import bannerAdd2 from "../../images/banner_3_add_bg_2.jpg";

const BannerSection = () => {
  return (
    <section className="banne_3   mt-5">
      <div className="container">
        <div className="row">

          {/* ================= LEFT SLIDER ================= */}
          <div className="col-xl-8">
            <div className="banner_content">

              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 4000 }}
                loop={true}
                pagination={{ clickable: true }}
                className="banner_slider"
              >
                <SwiperSlide>
                  <div
                    className="single_slider"
                    style={{ backgroundImage: `url(${slider3})` }}
                  >
                     
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div
                    className="single_slider"
                    style={{ backgroundImage: `url(${slider2})` }}
                  >
                     
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div
                    className="single_slider"
                    style={{ backgroundImage: `url(${slider1})` }}
                  >
                     
                  </div>
                </SwiperSlide>
                
              </Swiper>

            </div>
          </div>

          {/* ================= RIGHT BANNERS ================= */}
          <div className="col-xl-4">
            <div className="row">

              <div className="col-xl-12 col-md-6">
                <div
                  className="banne_3_add_item"
                  style={{ backgroundImage: `url(${bannerAdd1})` }}
                >
                  <div className="text">
                    <h4>Summer Offer</h4>
                    <h2>Healthy Organic Food</h2>
                    <Link to="/ShopDetails" className="common_btn">
                      shop now <span></span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-xl-12 col-md-6">
                <div
                  className="banne_3_add_item"
                  style={{ backgroundImage: `url(${bannerAdd2})` }}
                >
                  <div className="text">
                    <h4>Special Offer</h4>
                    <h2>Fresh Organic Food</h2>
                    <Link to="/ShopDetails" className="common_btn">
                      shop now <span></span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BannerSection;
