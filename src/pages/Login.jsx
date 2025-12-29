// src/pages/Login.jsx
import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async () => {
    console.log("Sign in attempted with:", { email, password });

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const user = await login(email, password);
      console.log("Login successful:", user);
      toast.success("Successfully logged in");

      if (user.accountType === "VENUE_OWNER") {
        navigate("/venue-dashboard");
      } else {
        // Redirect back to previous page if available
        if (location.state?.from) {
          navigate(location.state.from, { state: location.state });
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PlayLink</h1>
          <p className="text-gray-600">Sign in to PlayLink</p>
        </div>

        <div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition shadow-sm"
          >
            Sign in
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-500 hover:text-green-600 font-medium transition"
            >
              Sign up
            </Link>
          </p>

          {/* Optional: back button */}
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
}
