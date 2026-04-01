import React from "react";
import aboutImg from "../../images/about_img.jpg";

const AboutApp = () => {
  return (
    <section className="about pt_100 xs_pt_80 mt-80 mb-80 pb-80">
      <div className="container">
        <div className="row justify-content-between">


       {/* LEFT IMAGE */}
          <div className="col-xl-6 col-lg-6 wow fadeInRight">
            <div className="about_text">
              <div className="section_heading heading_left mb_20">
                <h4>About Us</h4>
                <h2>Welcome To Organic Agriculture Grocery Shop</h2>
              </div>

              <p>
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form, by
                injected humour, or mori words which slightly believable.
              </p>

              <ul>
                <li>
                  <span>01</span>
                  <h4>Organic products who are so</h4>
                </li>
                <li>
                  <span>02</span>
                  <h4>Healthy food everyday</h4>
                </li>
                <li>
                  <span>03</span>
                  <h4>Local growth of fresh food</h4>
                </li>
                <li>
                  <span>04</span>
                  <h4>Demoralized charms of pleasure</h4>
                </li>
              </ul>

              
            </div>
            <div className=" ">
                <a className="common_btn" href="/shop-details">
                    Start Using Mahal Today {" "}
                    <i className="fas fa-long-arrow-right" aria-hidden="true"></i>
                    <span></span>
                  </a>

              </div>
          </div>

            {/* RIGHT CONTENT */}
          <div className="col-xl-5 col-md-8 col-lg-6 wow fadeInLeft">
            <div className="about_img">
              <div className="img">
                <img
                  src={aboutImg}
                  alt="about"
                  className="img-fluid w-100"
                />
              </div>
              <p>
                “There are many variations its of passages of Lorem Ipsum nsi
                available, but the majority they suffered”
                <span> Robart Day</span>
              </p>
            </div>

          </div>



        </div>
      </div>
    </section>
  );
};

export default AboutApp;
