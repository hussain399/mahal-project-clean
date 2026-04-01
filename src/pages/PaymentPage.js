import React from "react";

import Topbar from "../components/Topbar";
// import Header from "../components/Header";
import Header from "../components/Mahal/Header";

// import PageBreadcrumb from "../components/PageBreadcrumb";

import Payment from "../components/Payment";

import Footer from "../components/Footer";

import ScrollToTopProgress from "../components/ScrollToTopProgress";

const PaymentPage = () => {
  return (
    <>
      <Topbar />  

      <Header />

      {/* <PageBreadcrumb title="Payment" /> */}

      <Payment />

      <Footer />

      <ScrollToTopProgress />
    </>
  );
};

export default PaymentPage ;
