// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

// // import Header from "../components/Header";
// import PageBreadcrumb from "../components/PageBreadcrumb";
// import ProductDetails from "../components/ProductDetails";
// import RelatedProducts from "../components/RelatedProducts";
// import Footer from "../components/Footer";
// import ScrollToTopProgress from "../components/ScrollToTopProgress";

// const ShopDetails = () => {
//   const { productId } = useParams();

//   const [selectedProductId, setSelectedProductId] = useState(productId);

//   useEffect(() => {
//     setSelectedProductId(productId);
//   }, [productId]);

//   return (
//     <>
//       {/* <Header /> */}
//       <PageBreadcrumb title="Product Details" />

//       {/* 🔼 TOP */}
//       <ProductDetails productId={selectedProductId} />

//       {/* 🔽 BOTTOM */}
//       <RelatedProducts
//         productId={selectedProductId}
//         onProductClick={setSelectedProductId}
//       />

//       <Footer />
//       <ScrollToTopProgress />
//     </>
//   );
// };

// export default ShopDetails;









import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Topbar from "../components/Mahal/Topbar";
// import Header from "../components/Header";
import Header from "../components/Mahal/Header";

import PageBreadcrumb from "../components/PageBreadcrumb";
import ProductDetails from "../components/ProductDetails";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";
// import Header from "../components/Header";

const ShopDetails = () => {
  const { productId } = useParams();

  const [selectedProductId, setSelectedProductId] = useState(productId);

  useEffect(() => {
    setSelectedProductId(productId);
  }, [productId]);

  return (
    <>
          <Topbar />
    <Header/>
      {/* <PageBreadcrumb title="Product Details" /> */}

      <ProductDetails productId={selectedProductId} />

      <RelatedProducts
        productId={selectedProductId}
        onProductClick={setSelectedProductId}
      />

      <Footer />
      <ScrollToTopProgress />
    </>
  );
};


export default ShopDetails;