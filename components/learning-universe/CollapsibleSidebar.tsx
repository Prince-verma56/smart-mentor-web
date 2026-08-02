"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MentorSidebar } from '@/components/mentors/MentorSidebar';

const STORAGE_KEY = 'lu-sidebar-collapsed';

interface CollapsibleSidebarProps {
  mentor: any;
}

/**
 * Wraps MentorSidebar with smooth framer-motion animation for the
 * Learning Universe layout. Persists collapsed state in localStorage
 * so it survives navigation and re-renders.
 */
export function CollapsibleSidebar({ mentor }: CollapsibleSidebarProps) {
  // Default collapsed=true (icon-only) to maximize canvas space.
  // Read persisted preference from localStorage on mount.
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-full overflow-hidden flex flex-col border-r border-white/[0.05] bg-background shrink-0 relative"
      style={{ minWidth: 0 }}
    >
      {/* Render MentorSidebar — suppress hydration flash before localStorage is read */}
      {mounted && (
        <MentorSidebar
          mentor={mentor}
          collapsed={collapsed}
          onToggleCollapse={toggle}
        />
      )}
    </motion.div>
  );
}
