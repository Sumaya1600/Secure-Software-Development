// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      { email, password }
    );

    const { token, user } = res.data;

    // STORE EVERYTHING NEEDED FOR RBAC
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
