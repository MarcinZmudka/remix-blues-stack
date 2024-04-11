import React from "react";

export const NoteSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-6 w-1/2 mb-2"></div>
      <div className="bg-gray-200 h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 h-4 w-3/4 mb-2"></div>
    </div>
  );
};
