import { useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, X, ChevronUp, Activity, Gauge, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAudioDevices } from "./useAudioDevices";
import { useVoicePreferences } from "./useVoicePreferences";

interface VoiceControlDockProps {
  mentorId: string;
  isMuted: boolean;
  isSpeakerMuted: boolean;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  endCall: () => void;
  vapiRef: any;
}

export function VoiceControlDock({ mentorId, isMuted, isSpeakerMuted, toggleMute, toggleSpeaker, endCall, vapiRef }: VoiceControlDockProps) {
  const { 
    microphones, speakers, selectedMicId, selectedSpeakerId, setMicrophone, setSpeaker 
  } = useAudioDevices(vapiRef);

  const { preferences, updatePreference } = useVoicePreferences(mentorId);

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

              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium cursor-pointer">Noise Suppression</Label>
                  <Switch checked={preferences.noiseSuppression} onCheckedChange={(v) => updatePreference("noiseSuppression", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium cursor-pointer">Echo Cancellation</Label>
                  <Switch checked={preferences.echoCancellation} onCheckedChange={(v) => updatePreference("echoCancellation", v)} />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Settings Dialog */}
      <Dialog>
        <DialogTrigger className="h-14 w-14 flex items-center justify-center rounded-full bg-transparent text-foreground hover:bg-muted/80 transition-all duration-300">
          <Settings className="h-6 w-6 opacity-80" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-border/50 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[10000]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Mentor Preferences</DialogTitle>
            <DialogDescription>
              Adjust your voice session settings here. Changes are saved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2"><Volume2 className="h-4 w-4" /> AI Voice Volume</Label>
              <div className="px-1 pt-2 pb-4">
                <input 
                  type="range" 
                  min="0" max="100" 
                  defaultValue="100" 
                  className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2"><Gauge className="h-4 w-4" /> Response Length</Label>
              <div className="flex bg-muted/50 p-1 rounded-lg">
                {(["Short", "Balanced", "Detailed"] as const).map((len) => (
                  <button 
                    key={len}
                    onClick={() => updatePreference("responseLength", len)}
                    className={cn("flex-1 text-xs py-2 rounded-md transition-all", preferences.responseLength === len ? "bg-background shadow-sm font-medium" : "hover:bg-background/50")}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/50">
              <Label className="text-sm font-medium flex items-center gap-2"><Activity className="h-4 w-4" /> Interaction Rules</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Allow AI to be interrupted</span>
                <Switch checked={preferences.autoInterrupt} onCheckedChange={(v) => updatePreference("autoInterrupt", v)} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Call Button */}
      <button 
        onClick={endCall}
        className="h-14 px-8 flex items-center justify-center gap-2 rounded-full bg-destructive text-destructive-foreground font-bold text-base shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-destructive/90 hover:scale-105 active:scale-95 transition-all duration-300 mx-2"
      >
        <X className="h-5 w-5" />
        End Call
      </button>

      {/* Speaker Split Button */}
      <div className={cn("flex items-center rounded-full overflow-hidden transition-all duration-300",
        isSpeakerMuted ? "bg-orange-500/15 text-orange-500" : "bg-transparent text-foreground hover:bg-muted/80"
      )}>
        <button 
          onClick={toggleSpeaker}
          className="h-14 w-14 flex items-center justify-center hover:bg-white/10 transition-colors"
          title={isSpeakerMuted ? "AI voice muted" : "Mute AI voice"}
        >
          {isSpeakerMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
        <Popover>
          <PopoverTrigger className="h-14 w-7 flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/5">
            <ChevronUp className="h-3 w-3 opacity-70" />
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card/95 backdrop-blur-xl border-border/50 p-4 rounded-2xl mb-4 shadow-2xl z-[10000]" sideOffset={15}>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Volume2 className="h-4 w-4" /> Audio Output Options</h4>
              
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
