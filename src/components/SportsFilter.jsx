import React from "react";

const SportsFilter = () => {
  const sports = [
    { name: "Tennis", icon: "🎾", color: "bg-green-100" },
    { name: "Basketball", icon: "🏀", color: "bg-orange-100" },
    { name: "Football", icon: "⚽", color: "bg-blue-100" },
    { name: "Badminton", icon: "🏸", color: "bg-purple-100" },
  ];

  return (
    <>
      {/* Sports Filter */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Popular Sports
        </h2> */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sports.map((sport, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 text-center cursor-pointer"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 ${sport.color}`}
              >
                {sport.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{sport.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SportsFilter;
