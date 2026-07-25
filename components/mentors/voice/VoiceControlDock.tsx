import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, X, ChevronUp, Check, Headphones } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAudioDevices } from "./useAudioDevices";
import { VoiceSettingsCenter } from "./VoiceSettingsCenter";

interface VoiceControlDockProps {
  mentorId: string;
  isMuted: boolean;
  isSpeakerMuted: boolean;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  endCall: () => void;
  vapiRef: any;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export function VoiceControlDock({ mentorId, isMuted, isSpeakerMuted, toggleMute, toggleSpeaker, endCall, vapiRef, isSettingsOpen, setIsSettingsOpen }: VoiceControlDockProps) {
  const { 
    microphones, speakers, selectedMicId, selectedSpeakerId, setMicrophone, setSpeaker 
  } = useAudioDevices(vapiRef);

  // Mute AI audio by querying the DOM for the audio element Vapi creates
  useEffect(() => {
    const audios = document.querySelectorAll("audio");
    audios.forEach(audio => {
      audio.muted = isSpeakerMuted;
    });
  }, [isSpeakerMuted]);

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-full bg-card/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
      
      {/* Microphone Split Button */}
      <div className={cn("flex items-center rounded-full overflow-hidden transition-all duration-300",
        isMuted ? "bg-destructive/15 text-destructive" : "bg-transparent text-foreground hover:bg-muted/80"
      )}>
        <button 
          onClick={toggleMute}
          className="h-14 w-14 flex items-center justify-center hover:bg-white/10 transition-colors"
          title={isMuted ? "Microphone muted" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        <Popover>
          <PopoverTrigger className="h-14 w-7 flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/5">
            <ChevronUp className="h-3 w-3 opacity-70" />
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card/95 backdrop-blur-xl border-border/50 p-4 rounded-2xl mb-4 shadow-2xl z-[10000]" sideOffset={15}>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Mic className="h-4 w-4" /> Microphone Options</h4>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Input Device</Label>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2">
                  {microphones.length === 0 && <p className="text-sm text-muted-foreground">No devices found</p>}
                  {microphones.map(mic => (
                    <button 
                      key={mic.deviceId}
                      onClick={() => setMicrophone(mic.deviceId)}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-left transition-colors"
                    >
                      <span className="truncate pr-2">{mic.label}</span>
                      {selectedMicId === mic.deviceId && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Settings Button */}
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className={cn("h-14 w-14 flex items-center justify-center rounded-full transition-all duration-300",
          isSettingsOpen ? "bg-white/10 text-white" : "bg-transparent text-foreground hover:bg-muted/80"
        )}
        title="Settings"
      >
        <Settings className="h-6 w-6 opacity-80" />
      </button>

      {/* End Call Button */}
      <button 
        onClick={endCall}
        className="h-14 px-6 flex items-center justify-center gap-2 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors ml-1"
      >
        <X className="h-5 w-5" />
        <span className="font-semibold text-sm">End Call</span>
      </button>

      {/* Speaker Split Button */}
      <div className={cn("flex items-center rounded-full overflow-hidden transition-all duration-300 ml-1",
        isSpeakerMuted ? "bg-amber-500/15 text-amber-500" : "bg-transparent text-foreground hover:bg-muted/80"
      )}>
        <button 
          onClick={toggleSpeaker}
          className="h-14 w-14 flex items-center justify-center hover:bg-white/10 transition-colors"
          title={isSpeakerMuted ? "Speaker muted" : "Mute speaker"}
        >
          {isSpeakerMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
        <Popover>
          <PopoverTrigger className="h-14 w-7 flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/5">
            <ChevronUp className="h-3 w-3 opacity-70" />
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card/95 backdrop-blur-xl border-border/50 p-4 rounded-2xl mb-4 shadow-2xl z-[10000]" sideOffset={15}>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Headphones className="h-4 w-4" /> Speaker Options</h4>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Output Device</Label>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2">
                  {speakers.length === 0 && <p className="text-sm text-muted-foreground">No devices found</p>}
                  {speakers.map(speaker => (
                    <button 
                      key={speaker.deviceId}
                      onClick={() => setSpeaker(speaker.deviceId)}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-left transition-colors"
                    >
                      <span className="truncate pr-2">{speaker.label}</span>
                      {selectedSpeakerId === speaker.deviceId && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </div>
  );
}
