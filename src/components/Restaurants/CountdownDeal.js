import React, { useEffect, useState } from "react";
import countdownImg from "../../images/countdown_2_img.jpg";

const CountdownDeal = () => {
  // 🎯 TARGET DATE (change as needed)
  const targetDate = new Date("2026-01-31T23:59:59").getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown_2 mt_90 xs_mt_70 pt_100 xs_pt_80 pb_100 xs_pb_80 pb-80">
      <div className="container">
        <div className="countdown_2_area">
          <div className="row justify-content-between">

            {/* LEFT CONTENT */}
            <div className="col-xl-6 col-lg-6 wow fadeInLeft">
              <div className="countdown_text">
                <div className="section_heading heading_left">
                  <h4>Monthly Offers</h4>
                  <h2>Our Specials Products deal of the day</h2>
                </div>

                <p>
                  There are many variations of passages of Lorem Ipsum
                  but majority have suffered.
                </p>

                {/* 🔥 DYNAMIC COUNTDOWN */}
                <div className="simply-countdown simply-countdown-one">

                  <div className="simply-section simply-days-section">
                    <div>
                      <span className="simply-amount">{timeLeft.days}</span>
                      <span className="simply-word">days</span>
                    </div>
                  </div>

                  <div className="simply-section simply-hours-section">
                    <div>
                      <span className="simply-amount">{timeLeft.hours}</span>
                      <span className="simply-word">hour</span>
                    </div>
                  </div>

                  <div className="simply-section simply-minutes-section">
                    <div>
                      <span className="simply-amount">{timeLeft.minutes}</span>
                      <span className="simply-word">minutes</span>
                    </div>
                  </div>

                  <div className="simply-section simply-seconds-section">
                    <div>
                      <span className="simply-amount">{timeLeft.seconds}</span>
                      <span className="simply-word">seconds</span>
                    </div>
                  </div>

                </div>

                <a className="common_btn" href="#">
                  shop now <i className="fas fa-long-arrow-right"></i>
                  <span></span>
                </a>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="col-xl-6 col-lg-6 wow fadeInRight">
              <div className="countdown_img">
                <img
                  src={countdownImg}
                  alt="countdown"
                  className="img-fluid w-100"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownDeal;
