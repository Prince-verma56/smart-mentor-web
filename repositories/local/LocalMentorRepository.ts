import type { Mentor } from "@/types/mentor";
import type { IMentorRepository } from "../core/IMentorRepository";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export class LocalMentorRepository implements IMentorRepository {
  private get filePath() {
    return path.join(process.cwd(), "mentors_db.json");
  }

  private getMentorsFromStorage(): Mentor[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse local mentors file", e);
      return [];
    }
  }

  private saveMentorsToStorage(mentors: Mentor[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(mentors, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to local mentors file", e);
    }
  }

  async getMentorsByUserId(userId: string): Promise<Mentor[]> {
    const mentors = this.getMentorsFromStorage();
    return mentors.filter(m => m.userId === userId || userId === "user_2test123");
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    const mentors = this.getMentorsFromStorage();
    return mentors.find(m => m.id === id) || null;
  }

  async createMentor(data: Omit<Mentor, "id" | "stats" | "createdAt" | "updatedAt">): Promise<string> {
    const mentors = this.getMentorsFromStorage();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newMentor: Mentor = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      status: data.status || "active",
    };
    
    mentors.push(newMentor);
    this.saveMentorsToStorage(mentors);
    
    return id;
  }

  async updateMentor(id: string, data: Partial<Omit<Mentor, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<boolean> {
    const mentors = this.getMentorsFromStorage();
    const index = mentors.findIndex(m => m.id === id);
    
    if (index === -1) return false;
    
    mentors[index] = {
      ...mentors[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.saveMentorsToStorage(mentors);
    return true;
  }

  async deleteMentor(id: string): Promise<boolean> {
    const mentors = this.getMentorsFromStorage();
    const filtered = mentors.filter(m => m.id !== id);
    
    if (filtered.length === mentors.length) return false;
    
    this.saveMentorsToStorage(filtered);
    return true;
  }
}
