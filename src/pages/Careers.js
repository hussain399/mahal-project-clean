import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Careers = () => {
  return (
    <>
      <Header />

      <section className="mahal-page-section">
        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h1 className="mahal-title">
              Careers at <span>MAHAL</span>
            </h1>
            <p className="mahal-desc">
              Build the future of B2B food sourcing with us.
            </p>
          </div>

          {/* INTRO */}
          <p className="text-center mb-4">
            MAHAL is a fast-growing B2B platform connecting restaurants and
            suppliers. We are always looking for passionate individuals who want
            to make an impact.
          </p>

          {/* WHY WORK WITH US */}
          <div className="row justify-content-center">
            <div className="col-lg-8">

              <h4 className="mb-3">
                <i className="fas fa-briefcase me-2 text-warning"></i>
                Why Work With Us?
              </h4>

              <ul className="mahal-icon-list">
                <li>
                  <i className="fas fa-rocket"></i>
                  Fast-growing startup environment
                </li>
                <li>
                  <i className="fas fa-bullseye"></i>
                  Real-world business impact
                </li>
                <li>
                  <i className="fas fa-users"></i>
                  Collaborative & supportive culture
                </li>
                <li>
                  <i className="fas fa-chart-line"></i>
                  Learning & growth opportunities
                </li>
              </ul>

            </div>
          </div>

          {/* CONTACT */}
          <div className="text-center mt-5">
            <p>
              <i className="fas fa-envelope-open-text text-warning me-2"></i>
              Send your resume to:
            </p>

            <h5>
              <a href="mailto:careers@mahal.com" className="mahal-link">
                careers@mahal.com
              </a>
            </h5>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default Careers;
