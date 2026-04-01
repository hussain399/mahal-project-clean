import React from "react";
import Reveal from "../components/Reveal";
// import Topbar from "../components/Topbar";
import Header from "../components/Header";

// import PageBreadcrumb from "../components/About/PageBreadcrumb";
import AboutMahal from "../components/About/About";
import WorkProcess from "../components/About/WorkProcess";
import MahalServices from "../components/About/MahalServices";

import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const About = () => {
  return (
    <>
      <Header />

      
        {/* <PageBreadcrumb title="About Us" /> */}
      

      <Reveal delay={0.1}>
        <AboutMahal />
      </Reveal>

      <Reveal delay={0.1}>
        <WorkProcess />
      </Reveal>

      <Reveal delay={0.1}>
        <MahalServices />
      </Reveal>

      <Footer />
      <ScrollToTopProgress />
    </>
  );
};

export default About;
