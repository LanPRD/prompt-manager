import type { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";

export class SearchPromptsUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(searchTerm?: string): Promise<PromptSummary[]> {
    const q = searchTerm?.trim() ?? "";

    console.log(`Searching for prompts with query: ${q}`);

    if (!q) {
      return this.promptRepository.findMany();
    }

    return this.promptRepository.searchMany(q);
  }
}
