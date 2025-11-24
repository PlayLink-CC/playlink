import React, { useState } from "react";
import { MapPin, Clock, DollarSign, CheckCircle, Calendar } from "lucide-react";

const CourtDetailPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [hours, setHours] = useState(1);

  const courtImages = [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=600&fit=crop",
  ];

  const availableTimes = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
  ];

  const facilities = [
    "Changing Rooms",
    "Parking Available",
    "Equipment Rental",
    "Shower Facilities",
    "Water Fountains",
    "First Aid Kit",
    "Lighting System",
    "Seating Area",
  ];

  const handleBooking = () => {
    if (selectedDate && selectedTime && hours) {
      alert(
        `Booking Request:\nDate: ${selectedDate}\nTime: ${selectedTime}\nHours: ${hours}\nTotal Cost: $${
          40 * hours
        }`
      );
    } else {
      alert("Please select date, time, and number of hours");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-96 bg-gray-200">
            <img
              src={courtImages[selectedImage]}
              alt="Court view"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            {courtImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  alt={`Court ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Court Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Elite Basketball Court
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  123 Sports Avenue, Downtown District, New York, NY 10001
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Court Type</p>
                    <p className="font-semibold">Indoor Basketball</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Per Hour Rate</p>
                    <p className="font-semibold text-green-600">$40.00</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Experience premium basketball action on our state-of-the-art
                  indoor court. Featuring professional-grade hardwood flooring,
                  adjustable hoops, and excellent lighting, this court is
                  perfect for casual games, training sessions, or competitive
                  matches. The climate-controlled environment ensures year-round
                  comfort, while the spacious layout accommodates full 5-on-5
                  games with plenty of room on the sidelines. Whether you're a
                  seasoned player or just starting out, our court provides the
                  ideal setting for an exceptional basketball experience.
                </p>
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Available Facilities
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {facilities.map((facility, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Court Location"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Book This Court
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Choose a time</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Hours
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setHours(Math.max(1, hours - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">
                      {hours}
                    </span>
                    <button
                      onClick={() => setHours(Math.min(8, hours + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Rate per hour</span>
                    <span className="font-semibold">$40.00</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Hours</span>
                    <span className="font-semibold">{hours}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-green-600">
                      ${40 * hours}.00
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors mt-6 cursor-pointer"
                >
                  Book Now
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  You'll receive a confirmation email after booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetailPage;
