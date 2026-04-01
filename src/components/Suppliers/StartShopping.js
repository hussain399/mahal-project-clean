import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCheck,
  faBoxesStacked,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";

const StartShopping = () => {
  return (
    <section className="mahal-about-section">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">
            <h6 className="mahal-subtitle">FOR SUPPLIERS</h6>
            <h2 className="mahal-title">
              Start Selling in <span>3 Simple Steps</span>
            </h2>
            <p className="mahal-desc">
              Join MAHAL and start receiving orders from verified restaurants
              with ease.
            </p>
          </div>
        </div>

        {/* STEPS */}
        <div className="row">

          {/* STEP 1 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-step-card text-center">

              <div className="mahal-step-icon">
                <FontAwesomeIcon icon={faUserCheck} />
              </div>

              <h4>Register as a Supplier</h4>
              <p>
                Create your supplier account and complete verification to get
                onboarded quickly.
              </p>

              <a
                href="/Registration"
                className="mahal-btn-secondary mt-3"
              >
                Create Supplier Account →
              </a>

            </div>
          </div>

          {/* STEP 2 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-step-card text-center">

              <div className="mahal-step-icon">
                <FontAwesomeIcon icon={faBoxesStacked} />
              </div>

              <h4>List Your Products</h4>
              <p>
                Upload products, manage pricing, and make your catalog visible
                to restaurants.
              </p>

              <a
                href="/Registration"
                className="mahal-btn-secondary mt-3"
              >
                Manage Products →
              </a>

            </div>
          </div>

          {/* STEP 3 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-step-card text-center">

              <div className="mahal-step-icon">
                <FontAwesomeIcon icon={faTruckFast} />
              </div>

              <h4>Receive & Fulfil Orders</h4>
              <p>
                Accept orders from restaurants, deliver on time, and grow your
                recurring business.
              </p>

              <a
                href="/SupplierLogIn"
                className="mahal-btn-secondary mt-3"
              >
                Go to Supplier Dashboard →
              </a>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StartShopping;
