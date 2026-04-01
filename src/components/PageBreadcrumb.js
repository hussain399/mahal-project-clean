import React from "react";
import { Link } from "react-router-dom";
import bgImg from "../images/breadcrumb_bg.jpg";

const PageBreadcrumb = ({ title }) => {
  return (
    <section
      className="page_breadcrumb"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="breadcrumb_overlay">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="breadcrumb_text text-center">
                <h1>{title}</h1>
                <ul>
                  <li>
                    <Link to="/">
                      <i className="fa fa-home-lg"></i> Home
                    </Link>
                  </li>
                  <li>
                    <span>{title}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageBreadcrumb;
