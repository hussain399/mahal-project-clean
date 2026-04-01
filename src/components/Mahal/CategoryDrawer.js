import React, { useState } from "react";
 

const drawerMenu = [
  {
    title: "All Categories",
    icon: "fa-layer-group",
    items: [
      {
        name: "Fresh Vegetables",
        more: ["Tomato", "Onion", "Potato", "Leafy Greens"],
      },
      {
        name: "Fruits",
        more: ["Apple", "Banana", "Orange", "Seasonal Fruits"],
      },
      {
        name: "Rice & Grains",
        more: ["Basmati Rice", "Sona Masoori", "Brown Rice"],
      },
      {
        name: "Oil & Ghee",
        more: ["Sunflower Oil", "Palm Oil", "Cow Ghee"],
      },
      {
        name: "Spices & Masalas",
        more: ["Chilli Powder", "Garam Masala", "Turmeric"],
      },
      {
        name: "Meat & Seafood",
        more: ["Chicken", "Mutton", "Fish", "Prawns"],
      },
      {
        name: "Dairy Products",
        more: ["Milk", "Curd", "Butter", "Paneer"],
      },
      {
        name: "Frozen Foods",
        more: ["Frozen Veggies", "Frozen Chicken"],
      },
      {
        name: "Beverages",
        more: ["Soft Drinks", "Juices", "Energy Drinks"],
      },
    ],
  },
  {
    title: "Trending Now",
    icon: "fa-fire",
    items: [
      { name: "Top Selling Ingredients" },
      { name: "Chicken Bulk Deals" },
      { name: "Premium Basmati Rice" },
      { name: "Organic Spices" },
      { name: "Best Rated Suppliers" },
    ],
  },
  {
    title: "Offers & Deals",
    icon: "fa-tags",
    items: [
      { name: "Today’s Deals" },
      { name: "Restaurant Exclusive Offers" },
      { name: "Bulk Order Discounts" },
      { name: "Clearance Sale" },
      { name: "Festival Offers" },
    ],
  },
  {
    title: "Restaurant Essentials",
    icon: "fa-utensils",
    items: [
      { name: "Daily Kitchen Needs" },
      { name: "Fast Moving Items" },
      { name: "Chef Recommended" },
      { name: "Ready-to-Cook Items" },
      { name: "Packaging Materials" },
    ],
  },
  {
    title: "Bulk & Wholesale",
    icon: "fa-boxes-stacked",
    items: [
      { name: "Wholesale Prices" },
      { name: "Minimum Order Deals" },
      { name: "Contract Pricing" },
      { name: "Monthly Supply Plans" },
    ],
  },
  {
    title: "Suppliers Hub",
    icon: "fa-truck",
    items: [
      { name: "Top Suppliers" },
      { name: "Nearby Suppliers" },
      { name: "Verified Vendors" },
      { name: "New Suppliers" },
    ],
  },
  {
    title: "Quick Actions",
    icon: "fa-bolt",
    items: [
      { name: "Repeat Last Order" },
      { name: "Saved Items" },
      { name: "Recently Viewed" },
      { name: "Create Shopping List" },
    ],
  },
  {
    title: "Account & Help",
    icon: "fa-user-circle",
    items: [
      { name: "Your Orders" },
      { name: "Your Profile" },
      { name: "Invoices & GST" },
      { name: "Help & Support" },
      { name: "Logout" },
    ],
  },
];

const CategoryDrawer = ({
  open,
  onClose,
  activeCategory,
  onCategoryChange,
}) => {
  const [openSection, setOpenSection] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [search, setSearch] = useState("");

  if (!open) return null;

  return (
    <div className="mm-drawer-overlay" onClick={onClose}>
      <div
        className="mm-drawer mm-drawer-mobile"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mm-drawer-header">
          <span>All</span>
          <i className="fas fa-times" onClick={onClose}></i>
        </div>

        {/* SEARCH */}
        <input
          className="mm-drawer-search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* BODY */}
        <div className="mm-drawer-body">
          {drawerMenu.map((section) => (
            <div key={section.title}>
              {/* MAIN SECTION */}
              <div
                className={`mm-drawer-item ${
                  openSection === section.title ? "active" : ""
                }`}
                onClick={() =>
                  setOpenSection(
                    openSection === section.title
                      ? null
                      : section.title
                  )
                }
              >
                <div className="mm-drawer-left">
                  <i className={`fas ${section.icon}`}></i>
                  <span>{section.title}</span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>

              {/* ITEMS */}
              {openSection === section.title &&
                section.items
                  .filter((i) =>
                    i.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.name}>
                      <div
                        className="mm-sub-item"
                        onClick={() =>
                          setOpenSub(
                            openSub === item.name ? null : item.name
                          )
                        }
                      >
                        {item.name}
                        {item.more && <span>›</span>}
                      </div>

                      {/* THIRD LEVEL */}
                      {item.more &&
                        openSub === item.name && (
                          <ul className="mm-third-level">
                            {item.more.map((sub) => (
                              <li
                                key={sub}
                                className={
                                  activeCategory === sub ? "active" : ""
                                }
                                onClick={() => {
                                  onCategoryChange(sub);
                                  onClose();
                                }}
                              >
                                {sub}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDrawer;
