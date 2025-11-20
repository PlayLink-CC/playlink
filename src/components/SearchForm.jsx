import React from "react";

const SearchForm = () => {
  return (
    <>
      {/* Search Form */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search Sport"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Search Location"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition">
            Search Courts
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchForm;
