/**
 * @file Signup.jsx
 * @description User registration page for PlayLink.
 * Connects to backend registration endpoint with validation.
 */

import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { User, Building2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isVenueOwner, setIsVenueOwner] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    // clear any previous inline error
    setError("");

    // Frontend validations (show toast notifications on invalid input)
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter a password.");
      return;
    }

    if (!city) {
      toast.error("Please select your city.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must match requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.");
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    // ✅ Backend call
    try {
      setIsSubmitting(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            email,
            password,
            city,
            accountType: isVenueOwner ? "VENUE_OWNER" : "USER",
          }),
        }
      );

      const data = await res.json();
      console.log("Register response:", res.status, data);

      if (!res.ok) {
        toast.error(data.message || "Registration failed. Please try again.");
        return;
      }

      // At this point user is created (and backend also sets cookie).
      // Use AuthContext to sync the local state with the new session
      await refreshUser();

      // Notify success and redirect based on account type
      if (isVenueOwner) {
        navigate("/venue-dashboard");
      } else {
        navigate("/");
      }
      toast.success("Welcome to PlayLink! Your account has been created.");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sign Up Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Join PlayLink and connect with amazing experiences
            </p>
          </div>

          <div>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this for account verification and notifications
              </p>
            </div>

            {/* City Selection */}
            <div className="mb-4">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select your city</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Negombo">Negombo</option>
                <option value="Matara">Matara</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={!showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your password should contain a minimum of 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={!showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your password should contain a minimum of 8 characters.
              </p>
            </div>

          </div>

          {/* Explicit Account Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsVenueOwner(false)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${!isVenueOwner
                  ? "border-green-600 bg-green-50/50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${!isVenueOwner ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <User size={20} />
                </div>
                <span className={`text-sm font-bold ${!isVenueOwner ? "text-green-700" : "text-gray-500"}`}>
                  Player
                </span>
                <span className="text-[10px] text-gray-400 mt-1 text-center leading-tight">
                  Book and join venues
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsVenueOwner(true)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isVenueOwner
                  ? "border-green-600 bg-green-50/50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${isVenueOwner ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Building2 size={20} />
                </div>
                <span className={`text-sm font-bold ${isVenueOwner ? "text-green-700" : "text-gray-500"}`}>
                  Venue Owner
                </span>
                <span className="text-[10px] text-gray-400 mt-1 text-center leading-tight">
                  List and manage venues
                </span>
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-green-500 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                I agree to the{" "}
                <Link
                  to="/terms-and-conditions"
                  className="text-green-500 hover:text-green-600 transition"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="text-green-500 hover:text-green-600 transition"
                >
                  Privacy Policy
                </Link>
                . I understand that my information will be processed according
                to these terms.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full font-medium py-3 rounded-lg transition shadow-sm ${isSubmitting
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
              }`}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-500 hover:text-green-600 font-medium transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
