import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const faqData = [
  {
    q: "Who can join MAHAL?",
    a: "Verified restaurants and food suppliers can register and use the MAHAL platform."
  },
  {
    q: "Is MAHAL available in all cities?",
    a: "MAHAL is currently expanding city by city. Availability depends on verified suppliers in your region."
  },
  {
    q: "Are suppliers verified?",
    a: "Yes. Every supplier goes through a strict verification process before onboarding."
  },
  {
    q: "Can I place bulk orders?",
    a: "Absolutely. MAHAL supports both daily procurement and bulk ordering."
  },
  {
    q: "Is there any subscription fee?",
    a: "No. Restaurants can register for free and pay only for what they order."
  }
];

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Header />

      <section className="mahal-page-section">
        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h1 className="mahal-title">
              Frequently Asked <span>Questions</span>
            </h1>
            <p className="mahal-desc">
              Everything you need to know about MAHAL.
            </p>
          </div>

          {/* FAQ ACCORDION */}
          <div className="mahal-faq-wrapper">
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`mahal-faq-item ${activeIndex === index ? "active" : ""}`}
              >
                <div
                  className="mahal-faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="question-left">
                    <i className="fas fa-question-circle"></i>
                    <h5>{item.q}</h5>
                  </div>

                  <i
                    className={`fas ${
                      activeIndex === index ? "fa-minus" : "fa-plus"
                    }`}
                  ></i>
                </div>

                {activeIndex === index && (
                  <div className="mahal-faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-5">
            <p>Still have questions?</p>
            <a href="/contact" className="mahal-btn-primary">
              Contact Support
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default FAQs;
