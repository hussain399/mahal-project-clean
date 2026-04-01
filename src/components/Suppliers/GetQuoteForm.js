import React, { useState } from "react";

const SupplierRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    country: "",
    city: "",
    businessType: "",
    email: "",
    countryCode: "+971",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <section className="mahal-form-section">
      <div className="container">
        <div className="row justify-content-center">

          <div className="col-lg-10">
            <div className="mahal-form-card">

              {/* HEADING */}
              <div className="text-center mb-4">
                <span className="mahal-pill">Supplier Registration</span>
                <h2 className="mahal-title">
                  Join <span>MAHAL Supplier Network</span>
                </h2>
                <p className="mahal-desc">
                  Register your business and start supplying verified restaurants
                  across the platform.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <div className="row">

                  <div className="col-md-6">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="UAE">UAE</option>
                      <option value="India">India</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select City</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Business Type</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Local Producer">Local Producer</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                    >
                      <option value="+971">UAE +971</option>
                      <option value="+91">India +91</option>
                      <option value="+966">Saudi +966</option>
                    </select>
                  </div>

                  <div className="col-md-8">
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                {/* BUTTON */}
                <div className="text-center mt-4">
                  <button type="submit" className="mahal-btn-primary px-5">
                    Submit & Continue →
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SupplierRegistrationForm;
