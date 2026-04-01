import React from "react";
// import Topbar from "../components/Topbar";
import Header from "../components/Header";

import Banner from "../components/Home/Banner";
// import PageBreadcrumb from "../components/About/PageBreadcrumb";
 
import ContactSection from "../components/ContactSection";


import Footer from "../components/Footer";

import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Contact = () => {
  return (
    <>
      {/* <Topbar />   */}

      <Header />

      {/* <PageBreadcrumb title="Contact Us" /> */}

      <ContactSection />

      <Footer />

      <ScrollToTopProgress />
    </>
  );
};

export default Contact;
