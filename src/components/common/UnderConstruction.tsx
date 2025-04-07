
import React from 'react';
import { HardHat, Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface UnderConstructionProps {
  pageName?: string;
}

const UnderConstruction = ({ pageName }: UnderConstructionProps) => {
  const location = useLocation();
  const path = location.pathname.slice(1); // Remove the leading slash
  const displayName = pageName || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="flex items-center mb-6 text-yellow-500">
        <Construction className="h-12 w-12 mr-2" />
        <HardHat className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-2">{displayName}</h1>
      <p className="text-lg text-gray-500 text-center mb-6">
        This page is currently under construction
      </p>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-500 rounded-full w-1/3 animate-pulse"></div>
      </div>
    </div>
  );
};

export default UnderConstruction;
