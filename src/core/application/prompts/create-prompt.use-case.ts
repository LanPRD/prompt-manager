import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";
import type { CreatePromptDto } from "./create-prompt.dto";

export class CreatePromptUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(data: CreatePromptDto): Promise<string> {
    const promptExists = await this.promptRepository.findByTitle(data.title);

    if (promptExists) {
      throw new Error("PROMPT_ALREADY_EXISTS");
    }

    const prompt = await this.promptRepository.create(data);
    return prompt.id;
  }
}
