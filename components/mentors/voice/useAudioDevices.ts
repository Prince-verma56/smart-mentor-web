import { useState, useEffect, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export function useAudioDevices(vapiRef: React.MutableRefObject<Vapi | null>) {
  const [microphones, setMicrophones] = useState<AudioDevice[]>([]);
  const [speakers, setSpeakers] = useState<AudioDevice[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const fetchDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn("enumerateDevices() not supported.");
      return;
    }

    try {
      // Prompt for permission if we don't have labels yet
      const devices = await navigator.mediaDevices.enumerateDevices();
      const needsPermission = devices.some(d => d.deviceId && !d.label);
      
      if (needsPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // close immediately
      }
      
      setHasPermission(true);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = allDevices
        .filter(device => device.kind === "audioinput")
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}...`
        }));
        
      const audioOutputs = allDevices
        .filter(device => device.kind === "audiooutput")
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 5)}...`
        }));

      setMicrophones(audioInputs);
      setSpeakers(audioOutputs);

      // Set defaults if empty
      if (audioInputs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioInputs[0].deviceId);
      }
      
      if (audioOutputs.length > 0 && !selectedSpeakerId) {
        setSelectedSpeakerId(audioOutputs[0].deviceId);
      }
      
    } catch (err: any) {
      console.error("Error fetching audio devices:", err);
      toast.error("Could not access audio devices");
    }
  }, [selectedMicId, selectedSpeakerId]);

  useEffect(() => {
    fetchDevices();
    
    // Listen for device changes (e.g. plugging in a headset)
    navigator.mediaDevices?.addEventListener("devicechange", fetchDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", fetchDevices);
    };
  }, [fetchDevices]);

  // Handle switching microphones
  const setMicrophone = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    // Future: Wait for Vapi to support mid-call device switching robustly
    // For now, Vapi automatically uses default. If it supports it, we'd do:
    // if (vapiRef.current) vapiRef.current.setAudioDevice(deviceId);
  };

  // Handle switching speakers
  const setSpeaker = async (deviceId: string) => {
    setSelectedSpeakerId(deviceId);
    // Requires standard HTML5 audio elements to implement `setSinkId`
    // Wait for Vapi full support, but we store the preference.
  };

  return {
    microphones,
    speakers,
    selectedMicId,
    selectedSpeakerId,
    setMicrophone,
    setSpeaker,
    hasPermission,
    refreshDevices: fetchDevices
  };
}
