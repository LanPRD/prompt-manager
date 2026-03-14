import { searchPromptAction } from "@/app/actions/prompt.actions";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();

jest.mock("@/core/application/prompts/search-prompts.use-case", () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({ execute: mockedSearchExecute }))
}));

describe("Server actions: Prompts", () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
  });

  describe("searchPromptAction", () => {
    it("should return success with the search term", async () => {
      const input = [{ id: 1, title: "Review Prompt", content: "This is a review prompt." }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append("q", "review");

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it("should return success and list all prompts if search term is empty", async () => {
      const input = [
        { id: 1, title: "Review Prompt", content: "This is a review prompt." },
        { id: 2, title: "Feedback Prompt", content: "This is a feedback prompt." }
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append("q", "");

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it("should return failure if an error occurs", async () => {
      mockedSearchExecute.mockRejectedValue(new Error("Database error"));

      const formData = new FormData();
      formData.append("q", "review");

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toEqual(undefined);
      expect(result.message).toBe("An error occurred while searching for prompts.");
    });
  });
});
