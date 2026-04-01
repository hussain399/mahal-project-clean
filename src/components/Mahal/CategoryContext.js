import { createContext, useState } from "react";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <CategoryContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
