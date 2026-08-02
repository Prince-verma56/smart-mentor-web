import { LearningCanvasWrapper } from "@/components/learning-universe/LearningCanvasWrapper";
import { CanvasSidebar } from "@/components/learning-universe/CanvasSidebar";

export default async function CanvasViewerPage({ params }: { params: Promise<{ mentorId: string, slug: string }> }) {
  const { mentorId, slug } = await params;

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 relative">
        <LearningCanvasWrapper mentorId={mentorId} slug={slug} />
      </div>
      <CanvasSidebar />
    </div>
  );
}
