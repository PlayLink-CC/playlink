import React, { useState } from "react";
import axios from "axios";

const SearchForm = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    // Skip if search text is only whitespace
    if (!searchText.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:3000/api/venues", {
        params: {
          search: searchText.trim(),
        },
      });
      onSearch(response.data);
    } catch (err) {
      console.error("Error searching venues:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setSearchText("");
    setError(null);
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:3000/api/venues");
      onSearch(response.data);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search Sport"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Search Location"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default SearchForm;
