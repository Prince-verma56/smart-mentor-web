import type { Mentor } from "@/types/mentor";

export interface IMentorRepository {
  getMentorsByUserId(userId: string): Promise<Mentor[]>;
  getMentorById(id: string): Promise<Mentor | null>;
  createMentor(data: Omit<Mentor, "id" | "stats" | "createdAt" | "updatedAt">): Promise<string>;
  updateMentor(id: string, data: Partial<Omit<Mentor, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<boolean>;
  deleteMentor(id: string): Promise<boolean>;
}
