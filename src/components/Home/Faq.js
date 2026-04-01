import React, { useState } from "react";
import aboutImg from "../../images/vegist.png";

const faqRight = [
  {
    q: "What is MAHAL?",
    a: "MAHAL is a B2B food procurement platform connecting restaurants with verified suppliers for transparent and reliable sourcing.",
  },
  {
    q: "How does the platform work?",
    a: "Restaurants browse suppliers, place orders, make secure payments, and receive scheduled deliveries through MAHAL.",
  },
  {
    q: "Who can join MAHAL?",
    a: "Restaurants, suppliers, and business partners can join MAHAL to grow their operations.",
  },
  {
    q: "Is support available?",
    a: "Yes, our support team assists businesses with onboarding, orders, and delivery coordination.",
  },
];

const AccordionItem = ({ item, isOpen, onClick }) => (
  <div className={`mahal-accordion-item ${isOpen ? "open" : ""}`}>
    <button className="mahal-accordion-header" onClick={onClick}>
      <span className="icon">
        <i className="fas fa-question-circle"></i>
      </span>
      {item.q}
      <span className="arrow">
        <i className="fas fa-chevron-down"></i>
      </span>
    </button>

    {isOpen && (
      <div className="mahal-accordion-body">
        <p>{item.a}</p>
      </div>
    )}
  </div>
);

const Faq = () => {
  const [openRight, setOpenRight] = useState(0);

  return (
    <section className="mahal-faq-section">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">
             <h6 className="mahal-subtitle">FAQ</h6>
            <h2 className="mahal-title">
              Questions? <span>We’ve Got You Covered</span>
            </h2>
          </div>
        </div>

        <div className="row align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="mahal-faq-image">
              <img src={aboutImg} alt="FAQ" />
            </div>
          </div>

          {/* RIGHT ACCORDION */}
          <div className="col-lg-6">
            <div className="mahal-accordion">
              {faqRight.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  isOpen={openRight === index}
                  onClick={() =>
                    setOpenRight(openRight === index ? null : index)
                  }
                />
              ))}
            </div>

            {/* CTA BUTTON */}
            <div className="mt-4">
              <a href="/contact" className="mahal-btn-primary">
                Still Have Questions?
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Faq;
