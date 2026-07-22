import type { MentorRoadmap } from "@/types/roadmap";

export const MOCK_ROADMAPS: Record<string, MentorRoadmap> = {
  "mentor-1": {
    mentorId: "mentor-1",
    title: "React Mastery Roadmap",
    description: "From hooks to RSC — a complete path to becoming a production React developer.",
    totalEstimatedHours: 90,
    lastUpdated: new Date().toISOString(),
    currentTopicId: "topic-5",
    phases: [
      {
        id: "phase-1",
        title: "Foundations",
        description: "Core React concepts",
        order: 1,
        completedCount: 4,
        totalCount: 5,
        topics: [
          { id: "topic-1", title: "JSX & Component Model", description: "", estimatedMinutes: 60, status: "completed", order: 1 },
          { id: "topic-2", title: "Props & State", description: "", estimatedMinutes: 90, status: "completed", order: 2 },
          { id: "topic-3", title: "Event Handling", description: "", estimatedMinutes: 45, status: "completed", order: 3 },
          { id: "topic-4", title: "Lists & Keys", description: "", estimatedMinutes: 30, status: "completed", order: 4 },
          { id: "topic-5", title: "Forms & Controlled Components", description: "", estimatedMinutes: 60, status: "in-progress", order: 5 },
        ],
      },
      {
        id: "phase-2",
        title: "Hooks Deep Dive",
        description: "Master all built-in and custom hooks",
        order: 2,
        completedCount: 4,
        totalCount: 8,
        topics: [
          { id: "topic-6", title: "useState & useReducer", description: "", estimatedMinutes: 90, status: "completed", order: 1 },
          { id: "topic-7", title: "useEffect Patterns", description: "", estimatedMinutes: 120, status: "completed", order: 2 },
          { id: "topic-8", title: "useContext", description: "", estimatedMinutes: 60, status: "completed", order: 3 },
          { id: "topic-9", title: "useMemo & useCallback", description: "", estimatedMinutes: 90, status: "completed", order: 4 },
          { id: "topic-10", title: "Custom Hooks", description: "", estimatedMinutes: 120, status: "available", order: 5 },
          { id: "topic-11", title: "useRef & DOM manipulation", description: "", estimatedMinutes: 60, status: "locked", order: 6 },
          { id: "topic-12", title: "useTransition & Concurrent", description: "", estimatedMinutes: 90, status: "locked", order: 7 },
          { id: "topic-13", title: "React Server Components", description: "", estimatedMinutes: 180, status: "locked", order: 8 },
        ],
      },
    ],
  },
};
