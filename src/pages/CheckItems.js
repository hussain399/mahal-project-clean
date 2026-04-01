import React from "react";


import Topbar from "../components/Mahal/Topbar";

import Header from "../components/Mahal/Header";

import Checkout from "../components/Checkout";
import Payment from "../components/Payment";
import Footer from "../components/Footer";

import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Check = () => {
  return (
    <>
      <Topbar />  

      <Header />

      {/* <PageBreadcrumb title="Checkout" /> */}

      <Checkout />
        {/* <Payment /> */}

      <Footer />

      <ScrollToTopProgress />
    </>
  );
};

export default Check ;
