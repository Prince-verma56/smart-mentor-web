import type { MentorRoadmap } from "@/types/roadmap";

export const MOCK_ROADMAPS: Record<string, MentorRoadmap> = {
  "mentor-1": {
    mentorId: "mentor-1",
    title: "React Mastery Roadmap",
    description: "From hooks to RSC — a complete path to becoming a production React developer.",
    total_estimated_hours: 90,
    progress_percent: 42,
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
          { id: "topic-1", title: "JSX & Component Model", description: "", difficulty: "beginner", estimated_minutes: 60, order_index: 1, status: "completed" },
          { id: "topic-2", title: "Props & State", description: "", difficulty: "beginner", estimated_minutes: 90, order_index: 2, status: "completed" },
          { id: "topic-3", title: "Event Handling", description: "", difficulty: "beginner", estimated_minutes: 45, order_index: 3, status: "completed" },
          { id: "topic-4", title: "Lists & Keys", description: "", difficulty: "beginner", estimated_minutes: 30, order_index: 4, status: "completed" },
          { id: "topic-5", title: "Forms & Controlled Components", description: "", difficulty: "beginner", estimated_minutes: 60, order_index: 5, status: "in-progress" },
        ],
      },
      {
        id: "phase-2",
        title: "Hooks Deep Dive",
        description: "Master all built-in and custom hooks",
        order: 2,
        completedCount: 0,
        totalCount: 8,
        topics: [
          { id: "topic-6", title: "useState & useReducer", description: "", difficulty: "intermediate", estimated_minutes: 90, order_index: 6, status: "locked" },
          { id: "topic-7", title: "useEffect Patterns", description: "", difficulty: "intermediate", estimated_minutes: 120, order_index: 7, status: "locked" },
          { id: "topic-8", title: "useContext", description: "", difficulty: "intermediate", estimated_minutes: 60, order_index: 8, status: "locked" },
          { id: "topic-9", title: "useMemo & useCallback", description: "", difficulty: "intermediate", estimated_minutes: 90, order_index: 9, status: "locked" },
          { id: "topic-10", title: "Custom Hooks", description: "", difficulty: "intermediate", estimated_minutes: 120, order_index: 10, status: "locked" },
          { id: "topic-11", title: "useRef & DOM manipulation", description: "", difficulty: "intermediate", estimated_minutes: 60, order_index: 11, status: "locked" },
          { id: "topic-12", title: "useTransition & Concurrent", description: "", difficulty: "advanced", estimated_minutes: 90, order_index: 12, status: "locked" },
          { id: "topic-13", title: "React Server Components", description: "", difficulty: "advanced", estimated_minutes: 180, order_index: 13, status: "locked" },
        ],
      },
    ],
  },
};
