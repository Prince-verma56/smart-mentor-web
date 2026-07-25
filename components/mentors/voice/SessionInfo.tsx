import { Clock, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionInfoProps {
  mentorName: string;
  duration: number; // in seconds
  callState: string;
}

export function SessionInfo({ duration, callState }: SessionInfoProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isConnected = callState !== "idle" && callState !== "connecting";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 bg-card/60 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-full shadow-lg">
        {/* Connection Status */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground")} />
          <span className={cn("text-xs font-semibold uppercase tracking-wider", isConnected ? "text-emerald-400" : "text-muted-foreground")}>
            {isConnected ? 'Connected' : 'Connecting'}
          </span>
        </div>
        
        {/* Session Time */}
        <div className="flex items-center gap-2 text-foreground/80">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-sm tracking-wider">{formatTime(duration)}</span>
        </div>

        {/* Mocked Latency (only show if connected) */}
        {isConnected && (
          <div className="flex items-center gap-1.5 pl-2 text-muted-foreground">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium">~120ms</span>
          </div>
        )}
      </div>
    </div>
  );
}
