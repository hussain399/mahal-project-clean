import React from "react";
import Slider from "react-slick";

import bgImg from "../../images/testimonial_bg.jpg";
import user1 from "../../images/testimonial_img_1.jpg";
import user2 from "../../images/testimonial_img_2.jpg";
import user3 from "../../images/testimonial_img_3.jpg";

/* ---------- CUSTOM ARROWS ---------- */
const NextArrow = ({ onClick }) => (
  <div className="mahal-testi-arrow next" onClick={onClick}>
    <i className="fas fa-chevron-right"></i>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="mahal-testi-arrow prev" onClick={onClick}>
    <i className="fas fa-chevron-left"></i>
  </div>
);

/* ---------- DATA ---------- */
const testimonials = [
  { name: "Bartholomew", rating: 5, img: user1 },
  { name: "Nigel Nigel", rating: 4.5, img: user2 },
  { name: "Robert Deni", rating: 3.5, img: user3 },
];

const Testimonial = () => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipe: false,
    draggable: false,
    touchMove: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section
      className="mahal-testimonial-section" 
    >
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-10 m-auto text-center">
               <h6 className="mahal-subtitle">Testimonials</h6>
            <h2 className="mahal-title white">
              Trusted by <span>Restaurants & Businesses</span>
            </h2>
          </div>
        </div>

        {/* SLIDER */}
        <Slider {...settings}>
          {testimonials.map((item, index) => (
            <div key={index}>
              <div className="mahal-testimonial-card">

                <div className="rating">
                  {[...Array(Math.floor(item.rating))].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                  {item.rating % 1 !== 0 && (
                    <i className="fas fa-star-half-alt"></i>
                  )}
                  <span>{item.rating}</span>
                </div>

                <p className="review">
                  MAHAL has transformed the way we source food supplies.
                  Transparent pricing and reliable delivery make operations smooth.
                </p>

                <div className="user">
                  <img src={item.img} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <span>Business Customer</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </Slider>

      

      </div>
    </section>
  );
};

export default Testimonial;
