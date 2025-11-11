import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 animate-pulse"></div>
    </div>
  );
};

export default SkeletonLoader;