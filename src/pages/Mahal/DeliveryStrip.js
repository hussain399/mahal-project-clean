import React from "react";
import deliveryImg from "../../images/delivery_boy.png";

const DeliveryStrip = () => {
  return (
    <section className="delivery_strip">
      <div className=" ">

        <div className="delivery_strip_inner">

          {/* LEFT IMAGE */}
          <div className="delivery_img">
            <img src={deliveryImg} alt="delivery service" />
          </div>

          {/* RIGHT CONTENT */}
          <div className="delivery_text section_heading ">

            <h4 className="b2b_tag text-left" >B2B & Bulk Orders</h4>

            <h2>
              Same-Day <span>Scheduled Delivery</span>
            </h2>
<br /> 
            <h3>10:00 AM – 08:00 PM</h3>

            <p className="desc">
              Reliable next-day delivery for <strong>restaurants, retailers, cafés,
              and bulk buyers</strong>.   <br />
              Designed for businesses that need speed, consistency, and freshness.
            </p>

           

            <div className="strip_actions">
              <a href="#" className="strip_btn primary">
                Read More
              </a>

              <a href="#" className="strip_btn outline">
                Contact Sales
              </a>
            </div>

          </div>

        </div>
         
         <div className="delivery_road"></div>

      </div>
    </section>
  );
};

export default DeliveryStrip;
