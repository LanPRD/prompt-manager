import type { CreatePromptDto } from "@/core/application/prompts/create-prompt.dto";
import { SearchPromptsUseCase } from "@/core/application/prompts/search-prompts.use-case";
import type { Prompt } from "@/core/domain/prompts/prompt.entity";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";

describe("SearchPromptsUseCase", () => {
  const input: Prompt[] = [
    {
      id: "1",
      title: "Review Prompt",
      content: "This is a review prompt.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { id: "2", title: "Test Prompt", content: "This is a test prompt.", createdAt: new Date(), updatedAt: new Date() }
  ];

  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (searchTerm: string) =>
      input.filter(prompt => prompt.title.toLowerCase().includes(searchTerm.toLowerCase())),
    findByTitle: function (title: string): Promise<Prompt | null> {
      throw new Error("Function not implemented.");
    },
    create: function (data: CreatePromptDto): Promise<void> {
      throw new Error("Function not implemented.");
    },
    update: function (id: string, data: Partial<CreatePromptDto>): Promise<Prompt> {
      throw new Error("Function not implemented.");
    },
    findById: function (id: string): Promise<Prompt | null> {
      throw new Error("Function not implemented.");
    }
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return all prompts when the search term is empty", async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const result = await useCase.execute("");

    expect(result).toEqual(input);
    expect(result).toHaveLength(2);
  });

  it("should return matching prompts when a search term is provided", async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const result = await useCase.execute("Review");

    expect(result).toEqual([input[0]]);
    expect(result).toHaveLength(1);
  });

  it("should apply trim to the search term before searching", async () => {
    const searchManySpy = jest.spyOn(repository, "searchMany");

    const useCase = new SearchPromptsUseCase(repository);
    await useCase.execute("  Test  ");

    expect(searchManySpy).toHaveBeenCalledWith("Test");
  });

  it("should handle undefined search term", async () => {
    const findManySpy = jest.spyOn(repository, "findMany");
    const searchManySpy = jest.spyOn(repository, "searchMany");
    const useCase = new SearchPromptsUseCase(repository);

    const resultUndefined = await useCase.execute(undefined);

    expect(resultUndefined).toMatchObject(input);
    expect(findManySpy).toHaveBeenCalledTimes(1);
    expect(searchManySpy).not.toHaveBeenCalled();
  });
});
