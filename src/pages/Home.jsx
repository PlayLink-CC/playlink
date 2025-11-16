import { MapPin, Check, X } from "lucide-react";

const Home = () => {
  const venues = [
    {
      id: 1,
      name: "Urban Sports Arena",
      location: "Downtown, City Center",
      pricePerHour: 25,
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
      facilities: ["Floodlights", "Changing Rooms", "Parking", "Refreshments"],
    },
    {
      id: 2,
      name: "Green Valley Courts",
      location: "Westside, Green Valley",
      pricePerHour: 30,
      image:
        "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80",
      facilities: ["Indoor Courts", "AC", "Locker Rooms", "Pro Shop"],
    },
    {
      id: 3,
      name: "Elite Sports Complex",
      location: "Eastside, Business District",
      pricePerHour: 35,
      image:
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&q=80",
      facilities: ["Premium Courts", "Coaching", "Cafe", "WiFi"],
    },
    {
      id: 4,
      name: "Community Sports Hub",
      location: "Northside, Residential Area",
      pricePerHour: 20,
      image:
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80",
      facilities: [
        "Family Friendly",
        "Equipment Rental",
        "Parking",
        "Playground",
      ],
    },
    {
      id: 5,
      name: "Lakeside Racquet Club",
      location: "Lakeshore Drive, Central Lake",
      pricePerHour: 28,
      image:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
      facilities: ["Indoor Courts", "Locker Rooms", "Café", "Free WiFi"],
    },
    {
      id: 6,
      name: "Sunset Arena Courts",
      location: "Sunset Boulevard, West District",
      pricePerHour: 22,
      image:
        "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&q=80",
      facilities: [
        "Floodlights",
        "Changing Rooms",
        "Equipment Rental",
        "Parking",
      ],
    },
    {
      id: 7,
      name: "HighPoint Sports Dome",
      location: "Tech Park, Skyline Road",
      pricePerHour: 40,
      image:
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&q=80",
      facilities: ["Air Conditioning", "Indoor Turf", "Pro Shop", "Café"],
    },
    {
      id: 8,
      name: "Palm Grove Courts",
      location: "Southside, Palm District",
      pricePerHour: 18,
      image:
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80",
      facilities: ["Outdoor Courts", "Parking", "Family Area", "Refreshments"],
    },
    {
      id: 9,
      name: "Metro Court Pavilion",
      location: "Metro Line Street, Downtown",
      pricePerHour: 32,
      image:
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80",
      facilities: ["Indoor Courts", "Coaching", "WiFi", "Lounge"],
    },
    {
      id: 10,
      name: "Riverside Sports Zone",
      location: "Riverside Road, East Valley",
      pricePerHour: 27,
      image:
        "https://images.unsplash.com/photo-1581089781785-603411fa81e5?w=800&q=80",
      facilities: ["Floodlights", "Parking", "Refreshments", "WiFi"],
    },
    {
      id: 11,
      name: "Arena Max Courts",
      location: "NorthTech Boulevard",
      pricePerHour: 38,
      image:
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      facilities: ["Premium Courts", "Coaching", "AC", "Locker Rooms"],
    },
    {
      id: 12,
      name: "CourtHub Athletic Center",
      location: "Central Park Zone",
      pricePerHour: 24,
      image:
        "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
      facilities: ["Outdoor Courts", "Equipment Rental", "Café", "Parking"],
    },
    {
      id: 13,
      name: "Victory Sports Haven",
      location: "Victory Lane, Midtown",
      pricePerHour: 30,
      image:
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80",
      facilities: ["AC Indoor Courts", "Pro Shop", "Parking", "WiFi"],
    },
  ];

  const sports = [
    { name: "Tennis", icon: "🎾", color: "bg-green-100" },
    { name: "Basketball", icon: "🏀", color: "bg-orange-100" },
    { name: "Football", icon: "⚽", color: "bg-blue-100" },
    { name: "Badminton", icon: "🏸", color: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-white to-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Sports Courts Instantly
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Find and book your perfect court in seconds
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition">
                Search Courts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Sports */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Popular Sports
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sports.map((sport, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 text-center cursor-pointer"
            >
              <div
                className={`w-20 h-20 ${sport.color} rounded-full flex items-center justify-center text-4xl mx-auto mb-4`}
              >
                {sport.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{sport.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Venue Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Trending Venues
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover hover:scale-110 transition duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {venue.name}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{venue.location}</span>
                </div>
                <div className="flex items-center text-green-600 font-bold mb-4">
                  <p>LKR</p>
                  <span className="text-lg ml-1">
                    {venue.pricePerHour}/hour
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Available Facilities:
                  </p>
                  <div className="space-y-1">
                    {venue.facilities.map((facility, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <Check size={14} className="text-green-500 mr-2" />
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition cursor-pointer">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
