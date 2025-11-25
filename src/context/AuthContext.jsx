// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // { id, email, accountType, ... }
  const [initializing, setInitializing] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users/authenticate", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json(); // { user: { id, email, accountType, ... } }
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch auth status", err);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, fetchCurrentUser, logout, initializing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
