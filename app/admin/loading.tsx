import React from 'react';

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-16 bg-slate-50 dark:bg-slate-900 rounded-lg border border-gray-150 dark:border-slate-800/50"></div>

      {/* Table/Cards Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="h-20 bg-slate-50 dark:bg-slate-900 rounded-lg border border-gray-150 dark:border-slate-800/50 flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-4 w-1/3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 hidden md:block"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 hidden md:block"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
