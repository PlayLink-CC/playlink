import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <span className="text-white font-semibold text-lg">PlayLink</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-white hover:text-green-400 transition">
            Home
          </a>
          <a href="#" className="text-white hover:text-green-400 transition">
            About
          </a>
          <a href="#" className="text-white hover:text-green-400 transition">
            Contact
          </a>
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
