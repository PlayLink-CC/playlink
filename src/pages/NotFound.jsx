import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Large Text */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[150px] font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-green-600 mb-2">
            404
          </h1>
          <div className="h-1 w-24 bg-linear-to-r from-green-400 to-green-600 mx-auto mb-8"></div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved or
          removed. Let's get you back on track!
        </p>

        {/* Animated SVG Illustration */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 bg-linear-to-r from-green-400 to-green-600 rounded-full opacity-10 blur-2xl animate-pulse"></div>
            <svg
              className="w-48 h-48 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4v2m0 6v2M7.08 6.47a9 9 0 1 1 9.84 0M9 3h6M9 21h6"
              />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105 duration-300"
          >
            <Home size={20} />
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105 duration-300"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 text-gray-600 text-sm">
          <p>Lost? You can always navigate using the menu above.</p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default NotFound;
