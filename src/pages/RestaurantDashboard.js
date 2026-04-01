import React from "react";

import Header from "../components/Header";

import RestaurantBanner from "../components/Restaurants/RestaurantBanner";
import BestSellProducts from "../components/Restaurants/BestSellProducts";
import FreshProducts from "../components/Restaurants/FreshProducts";
import SpecialProducts from "../components/Restaurants/SpecialProducts";
import CountdownDeal from "../components/Restaurants/CountdownDeal";
import InstagramSlider from "../components/Restaurants/InstagramSlider";
import BrandPartners from "../components/Home/BrandPartners";
import Categories from "../components/Restaurants/Categories";
import AddBannerSection from "../components/Restaurants/AddBannerSection";
import NewProducts from "../components/Restaurants/NewProducts";





import Footer from "../components/Footer";

import ScrollToTopProgress from "../components/ScrollToTopProgress";

const RestaurantDashboard = () => {
  return (
    <div className="bg1">
      {/* <Topbar />   */}

      <Header />

      <BestSellProducts />

      <NewProducts />

        <AddBannerSection />
      
      <FreshProducts />

      <CountdownDeal />

      <SpecialProducts  />

      <Categories />

      <InstagramSlider />

      <RestaurantBanner />

      <BrandPartners />

      <Footer />

      <ScrollToTopProgress />
  </div>
  );
};

export default RestaurantDashboard;
