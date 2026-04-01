import React, {useEffect,useState} from "react";
import Header from "../components/Mahal/Header";
import Topbar from "../components/Mahal/Topbar";
import PageBreadcrumb from "../components/About/PageBreadcrumb";
import HomeAbout from "../components/About/HomeAbout";
import Categories from "../components/Categories";
import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";
import { useLocation } from "react-router-dom";
import axios from "axios";
const CategorieList = () => {

    const location = useLocation();
  const params = new URLSearchParams(location.search);
  const promoId = params.get("promo");

  const [, setProducts] = useState([]);

  useEffect(() => {

    if (promoId) {
      axios
        .get(`http://127.0.0.1:5000/api/v1/promotions/${promoId}/products`)
        .then(res => {
          setProducts(res.data);
        });
    } else {
      axios
        .get("http://127.0.0.1:5000/api/gridlist")
        .then(res => {
          setProducts(res.data.products || []);
        });
    }

  }, [promoId]);
  return (
    <>
          <Topbar />
      <Header />

      {/* <PageBreadcrumb title="Categories List" /> */}

      <Categories />

      <Footer />

      <ScrollToTopProgress />
    </>
  );
};

export default CategorieList;
