import React, { useEffect, useState } from "react";
import heroVideo from "../../images/slider_Video.mp4";

const Banner = () => {

  const words = [
    "Trusted Suppliers",
    "Fresh Ingredients",
    "Competitive Prices",
    "Reliable Delivery"
  ];

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting) {
      // Typing
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
      }, 80);

      if (text === currentWord) {
        setTimeout(() => setIsDeleting(true), 1200);
      }

    } else {
      // Deleting
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
      }, 40);

      if (text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <section className="mahal-hero-video">

      {/* VIDEO BACKGROUND */}
      <video
        className="hero-video"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* DARK OVERLAY */}
      <div className="hero-overlay"></div>

      {/* CONTENT */}
      <div className="container hero-content">
        <div className="row">
          <div className="col-lg-10">

            <h3 className="hero-subtitle">
              MAHAL – B2B Food Supply Platform
            </h3>

            <h1 className="hero-title">
              Connecting Restaurants <br />
              with{" "}
              <span className="highlight typing-text">
                {text}
              </span>
              <span className="cursor">|</span>
            </h1>

            <p className="hero-text mt-3">
              Simplify procurement, manage orders efficiently,
              and build long-term partnerships — all in one platform.
            </p>

            <a className="mahal-btn-primary mt-5 big_btn" href="/Registration">
            <i className="fas fa-arrow-right ms-2"></i>
              Get Started with MAHAL
              
            </a>

          </div>
        </div>
      </div>

    </section>
  );
};

export default Banner;