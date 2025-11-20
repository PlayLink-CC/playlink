import React, { useState } from "react";

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
      const encodedSearch = encodeURIComponent(searchText.trim());
      const response = await fetch(
        `http://localhost:3000/api/venues?search=${encodedSearch}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch venues");
      }

      const data = await response.json();
      onSearch(data);
    } catch (err) {
      console.error("Error searching venues:", err);
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
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search Courts"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default SearchForm;
