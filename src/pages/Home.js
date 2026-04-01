import React from "react";
import Reveal from "../components/Reveal";

import Header from "../components/Header";
import Banner from "../components/Home/Banner";

// supplier
import AboutSupplier from "../components/Home/AboutSupplier";
import SupplierPartners from "../components/Home/SupplierPartners";

// Restaurant
import AboutRestaurant from "../components/Home/AboutRestaurant";
import RestaurantOffers from "../components/Home/RestaurantOngoingOffers";
import RestaurantDeals from "../components/Home/RestaurantDeals";

import Counter from "../components/Home/Counter";
import DownloadApp from "../components/Home/DownloadApp";

import BrandPartners from "../components/Home/BrandPartners";
import Testimonial from "../components/Home/Testimonial";

import PartOfMahal from "../components/Home/PartOfMahal";
import Faq from "../components/Home/Faq";
import Footer from "../components/Footer";

import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Home = () => {
  return (
    <>
      <Header />

       
        <Banner />
     

      <Reveal delay={0.1}>
        <Counter />
      </Reveal>

      {/* Restaurant */}
      <Reveal delay={0.1}>
        <AboutRestaurant />
      </Reveal>

      <Reveal delay={0.1}>
        <RestaurantDeals />
      </Reveal>

      <Reveal delay={0.1}>
        <RestaurantOffers />
      </Reveal>

      {/* Supplier */}
      <Reveal delay={0.1}>
        <AboutSupplier />
      </Reveal>

      <Reveal delay={0.1}>
        <SupplierPartners />
      </Reveal>

      {/* Mobile App */}
      <Reveal delay={0.1}>
        <DownloadApp />
      </Reveal>

      <Reveal delay={0.1}>
        <PartOfMahal />
      </Reveal>

      <Reveal delay={0.1}>
        <Testimonial />
      </Reveal>

      <Reveal delay={0.1}>
        <Faq />
      </Reveal>

      <Reveal delay={0.1}>
        <BrandPartners />
      </Reveal>

      <Footer />
      <ScrollToTopProgress />
    </>
  );
};

export default Home;
