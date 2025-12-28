// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [initialising, setInitialising] = useState(true);

  // Check if there is a valid session cookie and load current user
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/authenticate`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        setUser(null);
        setWalletBalance(null);
        return;
      }

      const data = await res.json();
      // data.user is the payload from the token: { id, email, accountType }
      setUser(data.user);

      // Fetch wallet balance if user exists
      await fetchWalletBalance();
    } catch (err) {
      console.error("Error fetching current user", err);
      setUser(null);
      setWalletBalance(null);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/my-balance`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
      } else {
        setWalletBalance(null);
      }
    } catch (err) {
      console.error("Failed to load wallet balance", err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCurrentUser();
      setInitialising(false);
    })();
  }, []);

  // Login – call backend and store user in context
  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Backend returns full user object: { id, fullName, email, ... }
    setUser({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      accountType: data.accountType,
    });

    // Fetch balance after login
    await fetchWalletBalance();

    return data;
  };

  // Logout – optional backend call + clear local auth state
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed (front-end will still clear user)", err);
    } finally {
      setUser(null);
      setWalletBalance(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    walletBalance,
    fetchWalletBalance,
    login,
    logout,
    refreshUser: fetchCurrentUser,
  };

  if (initialising) {
    // while we’re checking the cookie, don’t flash wrong UI
    return null;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);