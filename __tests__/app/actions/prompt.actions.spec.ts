import { createPromptAction, searchPromptAction } from "@/app/actions/prompt.actions";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();

jest.mock("@/core/application/prompts/search-prompts.use-case", () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({ execute: mockedSearchExecute }))
}));

jest.mock("@/core/application/prompts/create-prompt.use-case", () => ({
  CreatePromptUseCase: jest.fn().mockImplementation(() => ({ execute: mockedCreateExecute }))
}));

describe("Server actions: Prompts", () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
  });

  describe("createPromptAction", () => {
    it("should create a prompt successfully", async () => {
      mockedCreateExecute.mockResolvedValue(undefined);

      const validData = { title: "New Prompt", content: "This is a new prompt." };

      const result = await createPromptAction(validData);

      expect(result?.message).toBe("Prompt created successfully.");
      expect(result?.success).toBe(true);
    });

    it("should return validation errors for invalid input", async () => {
      const invalidData = { title: "", content: "" };

      const result = await createPromptAction(invalidData);

      expect(result?.success).toBe(false);
      expect(result?.errors).toBeDefined();
      expect(result?.message).toBe("Validation failed");
    });

    it("should return failure if prompt already exists", async () => {
      mockedCreateExecute.mockRejectedValue(new Error("PROMPT_ALREADY_EXISTS"));

      const validData = { title: "Existing Prompt", content: "This prompt already exists." };

      const result = await createPromptAction(validData);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe("A prompt with the same title already exists.");
    });
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
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockedSearchExecute.mockRejectedValue(new Error("Database error"));

      const formData = new FormData();
      formData.append("q", "review");

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toEqual(undefined);
      expect(result.message).toBe("An error occurred while searching for prompts.");
      consoleSpy.mockRestore();
    });
  });
});
