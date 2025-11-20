import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Venue from "./pages/Venue";
import BookingSummary from "./pages/BookingSummary";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* All routes inside this Route will use MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venue />} />
          <Route path="/booking-summary" element={<BookingSummary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
