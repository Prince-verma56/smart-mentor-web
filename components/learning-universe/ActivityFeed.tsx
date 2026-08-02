import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Plus, Edit2, Pin, Archive, Copy, Trash, Link } from 'lucide-react';

interface ActivityLogItem {
  id: string;
  canvas_id: string;
  action_type: string;
  details: any;
  created_at: string;
}

export function ActivityFeed({ activities, canvases }: { activities: ActivityLogItem[], canvases: any[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'CREATED': return <Plus className="w-4 h-4 text-emerald-400" />;
      case 'RENAMED': return <Edit2 className="w-4 h-4 text-blue-400" />;
      case 'PINNED': return <Pin className="w-4 h-4 text-amber-400" />;
      case 'ARCHIVED': return <Archive className="w-4 h-4 text-purple-400" />;
      case 'DUPLICATED': return <Copy className="w-4 h-4 text-sky-400" />;
      case 'DELETED': return <Trash className="w-4 h-4 text-red-400" />;
      case 'SHARED': return <Link className="w-4 h-4 text-indigo-400" />;
      default: return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getMessage = (activity: ActivityLogItem, canvasName: string) => {
    switch (activity.action_type) {
      case 'CREATED': return `Created canvas "${canvasName}"`;
      case 'RENAMED': return `Renamed "${activity.details?.old_name}" to "${activity.details?.new_name}"`;
      case 'PINNED': return `Pinned canvas "${canvasName}"`;
      case 'ARCHIVED': return `Archived canvas "${canvasName}"`;
      case 'DUPLICATED': return `Duplicated canvas "${canvasName}"`;
      case 'DELETED': return `Deleted canvas`;
      case 'SHARED': return `Created share link for "${canvasName}"`;
      default: return `Updated canvas "${canvasName}"`;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-3xl border border-white/5 bg-white/[0.01] border-dashed">
        <Activity className="w-10 h-10 text-white/20 mb-4" />
        <h4 className="text-white/80 font-medium mb-1">No Recent Activity</h4>
        <p className="text-sm text-white/40 text-center max-w-sm">
          Actions like creating, renaming, or pinning canvases will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-4">
      {activities.map(activity => {
        const canvas = canvases.find(c => c.id === activity.canvas_id);
        const name = canvas?.name || 'Unknown Canvas';
        return (
          <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="mt-1 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
              {getIcon(activity.action_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/90">
                {getMessage(activity, name)}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
