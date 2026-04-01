import React from "react";
// import Header from "../components/Header";
import PageBreadcrumb from "../components/About/PageBreadcrumb";
import Wishlistitems from "./Wishlistitems";


import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Wishlist = () => {
  return (
    <>

      {/* <Header /> */}

      <PageBreadcrumb title="Wishlist" />

     <Wishlistitems />

      <Footer />

      <ScrollToTopProgress />

    </>
  );
};

export default Wishlist;
