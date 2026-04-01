import React from "react";
import {
  HiTrendingUp,
  HiChartBar,
  HiCube
} from "react-icons/hi";
 

const suggestions = [
  {
    icon: <HiChartBar />,
    tag: "HIGH DEMAND",
    title: "High Demand This Week",
    desc: "Rice, cooking oil & frozen meat are seeing increased demand across restaurants.",
    action: "View High Demand Items",
  },
  {
    icon: <HiTrendingUp />,
    tag: "TRENDING",
    title: "Rising Market Trend",
    desc: "Imported spices & ready-to-cook items are trending among multi-chain kitchens.",
    action: "Explore Trending Products",
  },
  {
    icon: <HiCube />,
    tag: "BULK ADVANTAGE",
    title: "Best for Bulk Purchase",
    desc: "Suppliers offering better margins on bulk orders this week.",
    action: "See Bulk Opportunities",
  },
];

const MahalSuggestions = () => {
  return (
    <section className="mm-elevated-wrap">
      <div className="container">

        {/* HEADER */}
        <div className="mm-elevated-header">
          <h2>Suggested by Mahal</h2>
          <p>
            Smart insights derived from real-time supplier performance,
            buying behavior and demand trends.
          </p>
        </div>

        {/* CARDS */}
        <div className="mm-elevated-grid">
          {suggestions.map((item, i) => (
            <div className="mm-elevated-card" key={i}>

              {/* ICON */}
              <div className="mm-elevated-icon">
                {item.icon}
              </div>

              <span className="mm-elevated-tag">{item.tag}</span>

              <h4>{item.title}</h4>
              <p>{item.desc}</p>

              <div className="mm-elevated-cta">
                {item.action} →
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MahalSuggestions;
