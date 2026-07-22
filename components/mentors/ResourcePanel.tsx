import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Link as LinkIcon,
  StickyNote,
  Code2,
  Upload,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import type { Resource, ResourceType } from "@/types/resource";

interface ResourcePanelProps {
  mentorId: string;
  resources?: Resource[];
}

const TYPE_ICON: Record<ResourceType, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  note: <StickyNote className="h-4 w-4 text-yellow-500" />,
  code: <Code2 className="h-4 w-4 text-blue-500" />,
  url: <LinkIcon className="h-4 w-4 text-green-500" />,
  youtube: <LinkIcon className="h-4 w-4 text-red-500" />,
  github: <Code2 className="h-4 w-4 text-gray-500" />,
  image: <FileText className="h-4 w-4 text-purple-500" />,
  article: <FileText className="h-4 w-4 text-blue-400" />,
  flashcard: <StickyNote className="h-4 w-4 text-orange-500" />,
  cheatsheet: <FileText className="h-4 w-4 text-teal-500" />,
  exercise: <Code2 className="h-4 w-4 text-violet-500" />,
};

// Mock upcoming topics
const UPCOMING_TOPICS = [
  "Suspense & Error Boundaries",
  "Server Actions",
  "Route Handlers",
  "Middleware",
  "Image Optimization",
];

export function ResourcePanel({ mentorId, resources = [] }: ResourcePanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Upcoming topics */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium">Upcoming Topics</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-1">
            {UPCOMING_TOPICS.map((topic, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="truncate">{topic}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              {/* Extension point: file upload */}
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" disabled>
                <Upload className="h-3 w-3" />
                Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {resources.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                  <FolderIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  No resources yet. Upload PDFs, notes, or links.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {resources.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-muted transition-colors">
                    {TYPE_ICON[r.type]}
                    <span className="text-sm truncate flex-1">{r.title}</span>
                    <Badge variant="outline" className="text-xs">{r.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes placeholder */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-yellow-500" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground text-center py-4">
              Note-taking will be enabled when AI chat is connected.
            </p>
          </CardContent>
        </Card>

        {/* Bookmarks placeholder */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" />
              Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground text-center py-4">
              Save important messages as bookmarks during sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// Minimal folder icon since lucide has no FolderOpen in all versions
function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
