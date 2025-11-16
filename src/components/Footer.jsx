import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold">PlayLink</span>
              </div>
              <p className="text-gray-400 text-sm">
                Book sports courts instantly with confidence
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@playlink.com</li>
                <li>+94 (555) 1234</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 pt-8 border-t border-gray-800">
            Copyright © 2025 PlayLink. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
