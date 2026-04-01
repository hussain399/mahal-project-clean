import React from "react";
import aboutImg from "../../images/home-about-img.webp";
 

const points = [
  "Nunc iaculis libero in ipsum molestie fermentum, a molestie nulla aliquet.",
  "Integer egestas metus blandit sagittis vestibulum.",
  "Integer eget massa malesuada, semper metus in, mattis diam.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
];

const HomeAbout = () => {
  return (
    <section className="home-about-area">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-md-6">
            <img
              src={aboutImg}
              alt="About"
              loading="lazy"
              className="img-fluid"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-md-6">
            <div className="home-about-content">

              <p className="font-heading font-18 fw-medium primary-color mb-10">
                A Few Words About Us
              </p>

              <h2 className="mb-20">
                A shop for good People by good People
              </h2>

              <p className="mb-20">
                Decay is caused by bacteria that collect on teeth and feed on
                the carbohydrates in our diet. The bacteria produce acid that
                wears away at the enamel on our teeth.
              </p>

              {/* POINTS */}
              <div className="about-point">
                {points.map((text, index) => (
                  <div className="d-flex mt-10" key={index}>
                    <div className="flex-shrink-0 primary-color">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="flex-grow-1 ms-2">{text}</div>
                  </div>
                ))}
              </div>
 
            </div>
          </div>

          {/* DIVIDER */}
          <div className="col-12">
            <div className="divider border-b section-t-space"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeAbout;
