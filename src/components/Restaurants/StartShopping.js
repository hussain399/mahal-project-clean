import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faStore,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
 
 

const StartShopping = () => {
  return (
    <section
      className="mahal-about-section"
      
    >
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">
            <h6 className="mahal-subtitle">FOR RESTAURANTS</h6>
            <h2 className="mahal-title">
              Start Ordering in <span>3 Simple Steps</span>
            </h2>
            <p className="mahal-desc">
              Get started with MAHAL quickly and manage your restaurant
              procurement with ease.
            </p>
          </div>
        </div>

        {/* STEPS */}
        <div className="row">

          {/* STEP 1 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-step-card text-center">
             <div className="mahal-step-icon">
  <FontAwesomeIcon icon={faUserPlus} />
</div>

              <h4>Create Your Account</h4>
              <p>
                Register your restaurant and set up delivery details in just a
                few minutes.
              </p>
              <a href="/Registration" className="mahal-btn-outline mt-3 mahal-btn-secondary">
                Create Account →
              </a>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-step-card text-center">
              <div className="mahal-step-icon">
  <FontAwesomeIcon icon={faStore} />
</div>

              <h4>Explore Marketplace</h4>
              <p>
                Browse verified suppliers, compare prices, and add products to
                your cart.
              </p>
              <a href="/RestaurantLogIn" className="mahal-btn-outline mt-3 mahal-btn-secondary">
                Explore Marketplace →
              </a>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-step-card text-center">
             <div className="mahal-step-icon">
  <FontAwesomeIcon icon={faTruckFast} />
</div>

              <h4>Place & Track Orders</h4>
              <p>
                Confirm delivery and track your orders till they reach your
                kitchen.
              </p>
              <a href="/RestaurantLogIn" className="mahal-btn-outline mt-3 mahal-btn-secondary">
                Track Orders →
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StartShopping;
