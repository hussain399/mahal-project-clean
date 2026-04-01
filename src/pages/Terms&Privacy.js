import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const TermsAndPrivacy = () => {
  return (
    <>
      <Header />

      <section className="mahal-page-section">
        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h1 className="mahal-title">
              Terms & <span>Privacy Policy</span>
            </h1>
            <p className="mahal-desc">
              Transparency, security, and trust are at the core of MAHAL.
            </p>
          </div>

          {/* TERMS */}
          <div className="mahal-legal-card">
            <h3>
              <i className="fas fa-file-contract"></i> Terms of Service
            </h3>
            <p>
              MAHAL is a B2B technology platform connecting restaurants with
              verified food suppliers. By using our services, users agree to
              provide accurate business information and comply with all platform
              policies.
            </p>
            <p>
              Users are responsible for all activities performed through their
              accounts, including orders, payments, and communications.
            </p>
          </div>

          {/* PRIVACY */}
          <div className="mahal-legal-card">
            <h3>
              <i className="fas fa-user-shield"></i> Privacy Policy
            </h3>
            <p>
              We respect your privacy. MAHAL collects only the information
              necessary to operate the platform and deliver our services
              effectively.
            </p>
            <p>
              User data is securely stored, never sold to third parties, and
              handled in accordance with industry-standard security practices.
            </p>
          </div>

          {/* SECURITY */}
          <div className="mahal-legal-card">
            <h3>
              <i className="fas fa-lock"></i> Data & Payment Security
            </h3>
            <p>
              All transactions and sensitive data are protected using secure
              systems and encrypted communication protocols to ensure maximum
              safety.
            </p>
          </div>

          {/* CONTACT */}
          <div className="text-center mt-5">
            <p>
              For detailed legal documentation or questions, please contact our
              support team.
            </p>
            <a href="/contact" className="mahal-btn-primary mt-3">
              Contact Support
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default TermsAndPrivacy;
