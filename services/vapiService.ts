export class VapiService {
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.vapi.ai";

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || "";
  }

  /**
   * Creates a VAPI Assistant profile for a mentor.
   * This allows the frontend to instantly connect to a voice call with this persona.
   */
  async createMentorAssistant(mentorData: {
    name: string;
    role: string;
    subject: string;
    teachingStyle: string;
    learningGoal: string;
  }): Promise<string | null> {
    if (!this.apiKey) {
      console.warn("VAPI_API_KEY is missing. Voice AI will be disabled.");
      return null;
    }

    try {
      const prompt = `You are ${mentorData.name}, a ${mentorData.role} teaching ${mentorData.subject}. 
Your teaching style is: ${mentorData.teachingStyle}.
The student's goal is: ${mentorData.learningGoal}.
Be concise, encouraging, and helpful.`;

      const response = await fetch(`${this.apiUrl}/assistant`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${mentorData.name} - ${mentorData.subject}`,
          model: {
            provider: "openai",
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: prompt,
              }
            ]
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM", // Default realistic voice
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`VAPI Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id; // Returns the Assistant ID to be stored in the DB
    } catch (error) {
      console.error("Failed to create VAPI assistant:", error);
      return null;
    }
  }
}

export const vapiService = new VapiService();
