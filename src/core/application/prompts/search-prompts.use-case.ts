import type { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";

export class SearchPromptsUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(searchTerm?: string): Promise<PromptSummary[]> {
    const q = searchTerm?.trim() ?? "";

    if (!q) {
      return this.promptRepository.findMany();
    }

    return this.promptRepository.searchMany(q);
  }
}
