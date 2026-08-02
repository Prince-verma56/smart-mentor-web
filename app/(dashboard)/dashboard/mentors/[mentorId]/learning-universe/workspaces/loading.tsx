import React from 'react';
import Loader from '@/components/kokonutui/loader';

export default function WorkspacesLoading() {
  return (
    <div className="flex h-full w-full bg-gradient-to-b from-zinc-950 to-black">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-white/5 bg-black/40 p-6 flex flex-col shrink-0 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded mb-2"></div>
        <div className="h-3 w-48 bg-white/5 rounded mb-8"></div>
        
        <div className="space-y-2">
          <div className="h-10 w-full bg-white/5 rounded-xl"></div>
          <div className="h-10 w-full bg-white/5 rounded-xl"></div>
          <div className="h-10 w-full bg-white/5 rounded-xl"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-10 overflow-hidden">
        <div className="max-w-6xl w-full mx-auto">
          {/* Header */}
          <div className="h-12 w-96 bg-white/5 rounded-2xl mb-10 animate-pulse"></div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/[0.02] rounded-2xl border border-white/[0.03] animate-pulse"></div>
            ))}
          </div>

          {/* Canvas Cards */}
          <div className="mb-12">
            <div className="h-6 w-48 bg-white/5 rounded mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white/[0.02] rounded-2xl border border-white/[0.03] animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Centered Spinner as fallback overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Loader title="Loading Workspaces..." subtitle="Fetching your canvases" size="lg" />
      </div>
    </div>
  );
}
