/**
 * RevisionPlanner
 * 
 * Given a list of completed nodes, generates spaced repetition revision paths.
 * Mock implementation — replace with LangGraph in Phase 15.
 */

export interface RevisionRequest {
  completedNodeIds: string[];
  mentor_id: string;
  canvas_id?: string;
  difficulty_preference?: 'easy' | 'balanced' | 'challenging';
}

export interface RevisionItem {
  nodeId: string;
  nodeTitle: string;
  dueDate: string;           // ISO date string
  interval_days: number;     // Spaced repetition interval
  repetition_count: number;  // How many times reviewed
  priority: 'low' | 'medium' | 'high';
  review_type: 'flashcard' | 'quiz' | 'exercise' | 'project_review' | 'interview_q';
}

export interface RevisionPlan {
  items: RevisionItem[];
  totalItems: number;
  estimatedTimeMinutes: number;
  nextReviewDate: string;
  strategy: 'spaced_repetition' | 'daily' | 'weekly';
}

// Spaced repetition intervals (days) — SM-2 simplified
const INTERVALS = [1, 3, 7, 14, 30, 60, 90];

export class RevisionPlanner {
  /**
   * Generate a spaced repetition revision plan for completed nodes.
   * Swap this for LangGraph in Phase 15.
   */
  static async plan(request: RevisionRequest): Promise<RevisionPlan> {
    const { completedNodeIds } = request;
    
    await new Promise(r => setTimeout(r, 400));
    
    if (completedNodeIds.length === 0) {
      return {
        items: [],
        totalItems: 0,
        estimatedTimeMinutes: 0,
        nextReviewDate: new Date().toISOString(),
        strategy: 'spaced_repetition',
      };
    }

    const now = new Date();
    const items: RevisionItem[] = completedNodeIds.map((nodeId, i) => {
      const repetitionCount = Math.floor(Math.random() * 4);
      const intervalIndex = Math.min(repetitionCount, INTERVALS.length - 1);
      const intervalDays = INTERVALS[intervalIndex];
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + intervalDays);
      
      const reviewTypes: RevisionItem['review_type'][] = ['flashcard', 'quiz', 'exercise', 'project_review', 'interview_q'];
      
      return {
        nodeId,
        nodeTitle: `Node ${i + 1}`, // Will be enriched with actual title in Phase 15
        dueDate: dueDate.toISOString(),
        interval_days: intervalDays,
        repetition_count: repetitionCount,
        priority: intervalDays <= 3 ? 'high' : intervalDays <= 14 ? 'medium' : 'low',
        review_type: reviewTypes[i % reviewTypes.length],
      };
    });

    // Sort by due date (earliest first)
    items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const dueToday = items.filter(item => {
      const due = new Date(item.dueDate);
      return due.getDate() === now.getDate();
    });

    return {
      items,
      totalItems: items.length,
      estimatedTimeMinutes: items.length * 5, // ~5 min per revision item
      nextReviewDate: items[0]?.dueDate || now.toISOString(),
      strategy: 'spaced_repetition',
    };
  }

  /**
   * Calculate the next due date for a node based on SM-2 algorithm.
   */
  static nextDueDate(repetitionCount: number, performanceRating: 0 | 1 | 2 | 3 | 4 | 5): Date {
    let interval: number;
    if (performanceRating < 3) {
      interval = 1; // Repeat tomorrow
    } else {
      const idx = Math.min(repetitionCount, INTERVALS.length - 1);
      interval = INTERVALS[idx];
    }
    const date = new Date();
    date.setDate(date.getDate() + interval);
    return date;
  }
}
