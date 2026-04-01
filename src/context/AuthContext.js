import { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // demo purpose – later backend nunchi vastadi
  const user = {
    role: localStorage.getItem("role") || "restaurant", // supplier | restaurant
  };

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
