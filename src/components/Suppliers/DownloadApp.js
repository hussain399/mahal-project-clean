import React from "react";
import downloadImg from "../../images/download_img.png";

const DownloadApp = () => {
  return (
    <section className="download pt_100 xs_pt_70 pb_100 xs_pb_80 mt-80 mb-80">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-xl-5 col-md-5 col-lg-5">
            <div className="download_img">
              <img
                src={downloadImg}
                alt="Download App"
                className="img-fluid w-100"
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-xl-5 col-md-7 col-lg-7 m-auto">
            <div className="download_text">

              <div className="section_heading heading_left">
                <h4>Download This App</h4>
                <h2>Download Mahal App On IOS and Android</h2>
              </div>

              <p>
                It is a long established fact that a reader will be distracted
                by the readable content of a page when looking at its layout
                The point.
              </p>

              <ul>
                <li>
                  <a href="#" className="common_btn">
                    <i className="fab fa-apple"></i> Apple Store
                    <span></span>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fab fa-google-play"></i> Play Store
                  </a>
                </li>
              </ul>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
