import React from 'react';
import Loader from '@/components/kokonutui/loader';

export default function SettingsLoading() {
  return (
    <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-b from-zinc-950 to-black h-full w-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="h-8 w-64 bg-white/5 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-4 w-96 bg-white/5 rounded animate-pulse"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative min-h-[500px]">
          <div className="w-full md:w-64 shrink-0 space-y-2 animate-pulse opacity-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 w-full bg-white/5 rounded-xl"></div>
            ))}
          </div>

          <div className="flex-1 space-y-8 animate-pulse opacity-50">
            {[1, 2].map(i => (
              <div key={i} className="h-48 w-full bg-white/[0.02] border border-white/[0.03] rounded-2xl"></div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader title="Loading Settings..." subtitle="Fetching workspace configuration" size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}
