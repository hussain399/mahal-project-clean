 import React from "react";
// import Header from "../components/Header";
import Header from "../components/Mahal/Header";
import Topbar from "../components/Mahal/Topbar";
import PageBreadcrumb from "../components/About/PageBreadcrumb";
import CartView from "../components/CartView";
import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Cart = () => {
  return (
    <>
        <Topbar />
      <Header />

      {/* <PageBreadcrumb title="Cart View" /> */}

      <CartView />

      <Footer />

      <ScrollToTopProgress />
    </>
  );
};

export default Cart;
