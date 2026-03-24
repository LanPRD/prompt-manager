import type { CreatePromptDto } from "@/core/application/prompts/create-prompt.dto";
import type { PromptSummary } from "./prompt.entity";

export interface PromptRepository {
  findMany(): Promise<PromptSummary[]>;
  searchMany(searchTerm: string): Promise<PromptSummary[]>;
  findByTitle(title: string): Promise<PromptSummary | null>;
  create(data: CreatePromptDto): Promise<void>;
}
