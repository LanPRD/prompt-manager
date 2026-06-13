import { CreatePromptUseCase } from "@/core/application/prompts/create-prompt.use-case";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";

function makeRepository(override = {} as Partial<PromptRepository>): PromptRepository {
  return {
    findByTitle: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: "generated-id",
      title: "",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    ...override
  } as PromptRepository;
}

describe("CreatePromptUseCase", () => {
  it("should create a new prompt", async () => {
    const repository = makeRepository();
    const useCase = new CreatePromptUseCase(repository);

    const data = {
      title: "New Prompt",
      content: "This is a new prompt."
    };

    await useCase.execute(data);

    expect(repository.create).toHaveBeenCalledWith(data);
  });

  it("should fail to create a prompt if title already exists", async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue({
        title: "New Prompt",
        content: "This is an existing prompt."
      })
    });

    const useCase = new CreatePromptUseCase(repository);

    const data = {
      title: "New Prompt",
      content: "This is a new prompt."
    };

    await expect(useCase.execute(data)).rejects.toThrow("PROMPT_ALREADY_EXISTS");
  });
});
