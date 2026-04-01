import React from "react";
import Reveal from "../components/Reveal";
// import Topbar from "../components/Topbar";
import Header from "../components/Header";

// import PageBreadcrumb from "../components/About/PageBreadcrumb";
import BlogPage from "../components/BlogPage";

import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Blog = () => {
  return (
    <>
      <Header />

       
        {/* <PageBreadcrumb title="Blog" /> */}
       

      <Reveal delay={0.1}>
        <BlogPage />
      </Reveal>

      <Footer />
      <ScrollToTopProgress />
    </>
  );
};

export default Blog;
