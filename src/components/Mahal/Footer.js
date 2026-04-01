import React from "react";
import { Link } from "react-router-dom";

import footerLogo from "../../images/Logo.png";
import pay1 from "../../images/footer_payment_icon_1.jpg";
import pay2 from "../../images/footer_payment_icon_2.jpg";
import pay3 from "../../images/footer_payment_icon_3.jpg";

const Footer = () => {
  return (
    <footer className="footer_2 mt_175 xs_mt_135 pt-5">
      <div className="container">

        {/* FOOTER MAIN */}
        <div className="row justify-content-between">

          {/* BRAND */}
          <div className="col-xl-3 col-md-6 col-lg-4">
            <div className="footer_logo_area">
              <Link to="/" className="footer_logo">
                <img src={footerLogo} alt="Mahal B2B Marketplace" />
              </Link>
              <p className="mt-3">
                <b>Mahal </b> is a B2B marketplace connecting restaurants with
                verified suppliers for bulk and daily kitchen needs.
              </p>
            </div>
          </div>

          {/* MARKETPLACE */}
          <div className="col-xl-2 col-sm-6 col-lg-2">
            <div className="footer_link">
              <h3>Marketplace</h3>
              <ul>
                <li><Link to="/restaurantoffers">Restaurant Offers</Link></li>
                <li><Link to="/categorielist">Browse Categories</Link></li>
                <li><Link to="/suppliers">Find Suppliers</Link></li>
                <li><Link to="/restaurants">Restaurants</Link></li>
              </ul>
            </div>
          </div>

          {/* FOR RESTAURANTS */}
          <div className="col-xl-2 col-sm-6 col-lg-2">
            <div className="footer_link">
              <h3>For Restaurants</h3>
              <ul>
                <li><Link to="/restaurantlogin">Restaurant Login</Link></li>
                <li><Link to="/restaurantdashboard">Restaurant Dashboard</Link></li>
                <li><Link to="/restaurantdashboard/orders">My Orders</Link></li>
                <li><Link to="/restaurantdashboard/inventory">Inventory</Link></li>
              </ul>
            </div>
          </div>

          {/* FOR SUPPLIERS */}
          <div className="col-xl-2 col-sm-6 col-lg-2">
            <div className="footer_link">
              <h3>For Suppliers</h3>
              <ul>
                <li><Link to="/supplierlogin">Supplier Login</Link></li>
                <li><Link to="/supplierdashboard">Supplier Dashboard</Link></li>
                <li><Link to="/supplierdashboard/products">Manage Products</Link></li>
                <li><Link to="/supplierdashboard/orders">Manage Orders</Link></li>
              </ul>
            </div>
          </div>

          {/* SUPPORT */}
          <div className="col-xl-3 col-md-6 col-lg-4">
            <div className="footer_subscribe footer_link">
              <h3>Support & Company</h3>
              <ul>
                <li><Link to="/about">About Mahal</Link></li>
                <li><Link to="/contact">Contact Support</Link></li>
                <li><Link to="/support">Help Center</Link></li>
                <li><Link to="/documentation">Documentation</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="row">
          <div className="col-12">
            <div className="footer_copyright mt_70">
              <p>
                © {new Date().getFullYear()} Mahal. All Rights Reserved.
              </p>
              <ul>
                <li>Secure Payments :</li>
                <li><img src={pay1} alt="Payment" /></li>
                <li><img src={pay2} alt="Payment" /></li>
                <li><img src={pay3} alt="Payment" /></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
