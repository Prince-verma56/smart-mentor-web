import { convexClient } from "@/lib/convex";
import type { Mentor } from "@/types/mentor";

// We use any for the api function references because the types are generated
// by running `npx convex dev` which the user will run later.
const api_mentors_getByUserId: any = "mentors:getByUserId";
const api_mentors_getById: any = "mentors:getById";
const api_mentors_createMentor: any = "mentors:createMentor";

export class MentorRepository {
  async getMentorsByUserId(userId: string): Promise<Mentor[]> {
    try {
      const mentors = await convexClient.query(api_mentors_getByUserId, { userId });
      return mentors as Mentor[];
    } catch (error) {
      console.error("Error fetching mentors:", error);
      return [];
    }
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    try {
      const mentor = await convexClient.query(api_mentors_getById, { id });
      return mentor as Mentor | null;
    } catch (error) {
      console.error("Error fetching mentor by id:", error);
      return null;
    }
  }

  async createMentor(data: Omit<Mentor, "id" | "stats" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const id = await convexClient.mutation(api_mentors_createMentor, data);
      return id as string;
    } catch (error) {
      console.error("Error creating mentor:", error);
      throw error;
    }
  }
}

export const mentorRepository = new MentorRepository();
