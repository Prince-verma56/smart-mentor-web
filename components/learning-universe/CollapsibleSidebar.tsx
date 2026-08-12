"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MentorSidebar } from '@/components/mentors/MentorSidebar';
import { useSidebarStore } from '@/stores/sidebarStore';

interface CollapsibleSidebarProps {
  mentor: any;
}

/**
 * Wraps MentorSidebar with smooth framer-motion animation for the
 * Learning Universe layout. Uses global Zustand store to perfectly
 * sync state with MentorWorkspace and avoid sudden jumps.
 */
export function CollapsibleSidebar({ mentor }: CollapsibleSidebarProps) {
  const { collapsed, setCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full overflow-hidden flex flex-col border-r border-white/[0.05] bg-background shrink-0 relative"
      style={{ minWidth: 0 }}
    >
      {/* Suppress hydration mismatch for icon-only mode */}
      <div className="w-full h-full">
        {mounted ? (
          <MentorSidebar
            mentor={mentor}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        ) : null}
      </div>
    </motion.div>
  );
}
