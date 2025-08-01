import { z } from "zod";

export const lifeCategories = [
  "health",
  "relationships", 
  "romance",
  "personal",
  "fun",
  "community",
  "career",
  "finances"
] as const;

export const lifeCategoryLabels = {
  health: "Health & Fitness",
  relationships: "Friends & Family", 
  romance: "Romance / Love Life",
  personal: "Personal Development",
  fun: "Fun & Recreation",
  community: "Community & Contribution",
  career: "Career / Business",
  finances: "Finances"
} as const;

export type LifeCategory = typeof lifeCategories[number];

export const assessmentSchema = z.object({
  satisfaction: z.record(z.number().min(1).max(10)),
  motivation: z.record(z.number().min(1).max(10))
});

export const emailResultsSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  updates: z.boolean().optional(),
  assessmentData: assessmentSchema
});

export type AssessmentData = z.infer<typeof assessmentSchema>;
export type EmailResultsRequest = z.infer<typeof emailResultsSchema>;

export interface CalculatedResults {
  satisfaction: Record<LifeCategory, number>;
  motivation: Record<LifeCategory, number>;
  improvement: Record<LifeCategory, number>;
  priority: Record<LifeCategory, number>;
  priorityRanked: Array<{
    category: LifeCategory;
    label: string;
    satisfaction: number;
    motivation: number;
    improvement: number;
    priority: number;
  }>;
}
