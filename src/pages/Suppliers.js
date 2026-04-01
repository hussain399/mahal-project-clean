import React from "react";
import Reveal from "../components/Reveal";

import Header from "../components/Header";
import Banner from "../components/Suppliers/Banner";
import DownloadApp from "../components/Suppliers/DownloadApp";
import About from "../components/Suppliers/About";
import StartShopping from "../components/Suppliers/StartShopping";
import GetQuoteForm from "../components/Suppliers/GetQuoteForm";
import BrandPartners from "../components/Suppliers/BrandPartners";
import TestimonialTwo from "../components/Suppliers/TestimonialTwo";
import SupplierBenefits from "../components/Suppliers/SupplierBenefits";
import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Suppliers = () => {
  return (
    <>
      <Header />

    
        <Banner />
       

      <Reveal delay={0.1}>
        <About />
      </Reveal>

      <Reveal delay={0.1}>
        <StartShopping />
      </Reveal>

      <Reveal delay={0.1}>
        <SupplierBenefits />
      </Reveal>

      <Reveal delay={0.1}>
        <TestimonialTwo />
      </Reveal>

      <Reveal delay={0.1}>
        <GetQuoteForm />
      </Reveal>

      <Reveal delay={0.1}>
        <BrandPartners />
      </Reveal>

       

      <Footer />
      <ScrollToTopProgress />
    </>
  );
};

export default Suppliers;
