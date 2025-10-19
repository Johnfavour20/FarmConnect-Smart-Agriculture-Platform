
import React from 'react';
import { LeafIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <LeafIcon className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-green-800">FarmConnect</h1>
        </div>
      </div>
    </header>
  );
};
