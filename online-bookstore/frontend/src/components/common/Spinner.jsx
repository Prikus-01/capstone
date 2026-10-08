import React from 'react';

export default function Spinner({ className = '' }) {
  return (
    <div className={`w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
