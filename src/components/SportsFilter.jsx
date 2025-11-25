/**
 * @file SportsFilter.jsx
 * @description Sports category filter component displaying popular sports as clickable cards.
 */

import React from "react";

/**
 * @param {string|null} selectedSport  - e.g. "Tennis"
 * @param {function}   [onSportToggle] - called with sport name or null when toggled
 */
const SportsFilter = ({ selectedSport, onSportToggle }) => {
  const sports = [
    { name: "Tennis", icon: "🎾", color: "bg-green-100" },
    { name: "Basketball", icon: "🏀", color: "bg-orange-100" },
    { name: "Football", icon: "⚽", color: "bg-blue-100" },
    { name: "Badminton", icon: "🏸", color: "bg-purple-100" },
  ];

  const handleClick = (sportName) => {
    if (!onSportToggle) return;
    // clicking again toggles off
    const next = selectedSport === sportName ? null : sportName;
    onSportToggle(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {sports.map((sport) => {
          const active = selectedSport === sport.name;
          return (
            <button
              key={sport.name}
              type="button"
              onClick={() => handleClick(sport.name)}
              className={
                "bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 md:p-8 text-center cursor-pointer border " +
                (active ? "border-green-500 ring-2 ring-green-400" : "border-transparent")
              }
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 ${sport.color}`}
              >
                {sport.icon}
              </div>
              <h3
                className={
                  "font-semibold " +
                  (active ? "text-green-600" : "text-gray-900")
                }
              >
                {sport.name}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SportsFilter;
