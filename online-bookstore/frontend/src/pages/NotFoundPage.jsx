import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="text-center">
        <BookOpen size={56} className="text-gray-600 mx-auto mb-4" />
        <h1 className="text-6xl font-black text-gray-700 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-400 hover:underline text-sm">← Back to Home</Link>
      </div>
    </div>
  );
}
