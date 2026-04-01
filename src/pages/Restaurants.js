import React from "react";
import Reveal from "../components/Reveal";

import Header from "../components/Header";
import Banner from "../components/Restaurants/Banner";
import About from "../components/Restaurants/About";
import StartShopping from "../components/Restaurants/StartShopping";
import GetQuoteForm from "../components/Restaurants/GetQuoteForm";
import BrandPartners from "../components/Restaurants/BrandPartners";
import TestimonialTwo from "../components/Restaurants/TestimonialTwo";
import RestaurantBenefits from "../components/Restaurants/RestaurantBenefits";
import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Restaurants = () => {
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
        <RestaurantBenefits />
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

export default Restaurants;
