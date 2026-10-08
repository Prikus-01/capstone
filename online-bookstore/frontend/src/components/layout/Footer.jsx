import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#242424] border-t border-[#3a3a3a] mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold mb-3">
              <BookOpen size={18} />
              <span>Book Worm</span>
            </div>
            <p className="text-xs text-gray-500">Your favourite online bookstore with thousands of titles.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Browse</h4>
            <ul className="space-y-1">
              <li><Link to="/catalogue" className="text-xs text-gray-500 hover:text-gray-300">All Books</Link></li>
              <li><Link to="/categories/fiction" className="text-xs text-gray-500 hover:text-gray-300">Fiction</Link></li>
              <li><Link to="/categories/self-help" className="text-xs text-gray-500 hover:text-gray-300">Self Help</Link></li>
              <li><Link to="/categories/technology" className="text-xs text-gray-500 hover:text-gray-300">Technology</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Account</h4>
            <ul className="space-y-1">
              <li><Link to="/orders" className="text-xs text-gray-500 hover:text-gray-300">My Orders</Link></li>
              <li><Link to="/cart" className="text-xs text-gray-500 hover:text-gray-300">Cart</Link></li>
              <li><Link to="/profile" className="text-xs text-gray-500 hover:text-gray-300">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Help</h4>
            <ul className="space-y-1">
              <li><span className="text-xs text-gray-500">Returns & Refunds</span></li>
              <li><span className="text-xs text-gray-500">Shipping Policy</span></li>
              <li><span className="text-xs text-gray-500">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-[#3a3a3a] text-center text-xs text-gray-600">
          © 2024 Book Worm. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
