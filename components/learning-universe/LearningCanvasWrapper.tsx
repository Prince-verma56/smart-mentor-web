"use client";

import dynamic from 'next/dynamic';

const LearningCanvas = dynamic(
  () => import('./LearningCanvas').then((mod) => mod.LearningCanvas),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#020617] flex items-center justify-center text-muted-foreground text-sm">Loading Canvas...</div> }
);

export function LearningCanvasWrapper({ mentorId }: { mentorId: string }) {
  return <LearningCanvas mentorId={mentorId} />;
}
