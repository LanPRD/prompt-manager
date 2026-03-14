import type { PromptSummary } from "./prompt.entity";

export interface PromptRepository {
  findMany(): Promise<PromptSummary[]>;
  searchMany(searchTerm: string): Promise<PromptSummary[]>;
}
