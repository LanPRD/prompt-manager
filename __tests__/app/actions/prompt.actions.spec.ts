import {
  createPromptAction,
  deletePromptAction,
  getPromptsAction,
  searchPromptAction,
  updatePromptAction
} from "@/app/actions/prompt.actions";
import { revalidatePath } from "../../../__mocks__/next-cache";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));

const mockedFindMany = jest.fn();
const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

jest.mock("@/infra/repository/prisma-prompt.repository", () => ({
  PrismaPromptRepository: jest.fn().mockImplementation(() => ({ findMany: mockedFindMany }))
}));

jest.mock("@/core/application/prompts/search-prompts.use-case", () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({ execute: mockedSearchExecute }))
}));

jest.mock("@/core/application/prompts/create-prompt.use-case", () => ({
  CreatePromptUseCase: jest.fn().mockImplementation(() => ({ execute: mockedCreateExecute }))
}));

jest.mock("@/core/application/prompts/update-prompt.use-case", () => ({
  UpdatePromptUseCase: jest.fn().mockImplementation(() => ({ execute: mockedUpdateExecute }))
}));

jest.mock("@/core/application/prompts/delete-prompt.use-case", () => ({
  DeletePromptUseCase: jest.fn().mockImplementation(() => ({ execute: mockedDeleteExecute }))
}));

describe("Server actions: Prompts", () => {
  beforeEach(() => {
    mockedFindMany.mockReset();
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
    revalidatePath.mockReset();
  });

  describe("createPromptAction", () => {
    it("should create a prompt successfully", async () => {
      mockedCreateExecute.mockResolvedValue(undefined);

      const validData = { title: "New Prompt", content: "This is a new prompt." };

      const result = await createPromptAction(validData);

      expect(result?.message).toBe("Prompt created successfully.");
      expect(result?.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledTimes(1);
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

    it("should return the generic error message for unknown errors", async () => {
      mockedCreateExecute.mockRejectedValue(new Error("UNKNOWN_ERROR"));

      const validData = { title: "New Prompt", content: "This is a new prompt." };

      const result = await createPromptAction(validData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("An error occurred while creating the prompt.");
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

    it("should treat missing query key as empty string", async () => {
      mockedSearchExecute.mockResolvedValue([]);

      const result = await searchPromptAction({ success: true }, new FormData());

      expect(result.success).toBe(true);
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

  describe("updatePromptAction", () => {
    it("should update a prompt successfully", async () => {
      mockedUpdateExecute.mockResolvedValue({});

      const promptId = "1";

      const data = {
        id: promptId,
        title: "new title",
        content: "new content"
      };

      const result = await updatePromptAction(data);

      expect(result).toMatchObject({
        success: true,
        message: "Prompt updated successfully."
      });
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });

    it("should return a validation error when fields are missing", async () => {
      const data = {
        id: "1",
        title: "",
        content: ""
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation error");
      expect(result.errors).toBeDefined();
    });

    it("should return an error when the prompt does not exist", async () => {
      mockedUpdateExecute.mockRejectedValue(new Error("PROMPT_NOT_FOUND"));

      const promptId = "1";

      const data = {
        id: promptId,
        title: "New Title",
        content: "New Content"
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Prompt not found");
    });

    it("should return the generic error when update fails", async () => {
      mockedUpdateExecute.mockRejectedValue(new Error("UNKNOWN_ERROR"));

      const promptId = "1";

      const data = {
        id: promptId,
        title: "New Title",
        content: "New Content"
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to update prompt.");
    });
  });

  describe("deletePromptAction", () => {
    it("should delete a prompt successfully", async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = "1";

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Prompt removed successfully.");
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });

    it("should return an error when the id is empty", async () => {
      const promptId = "";

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Prompt ID is required.");
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should return an error when the prompt does not exist", async () => {
      mockedDeleteExecute.mockRejectedValue(new Error("PROMPT_NOT_FOUND"));
      const promptId = "1";

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Prompt not found.");
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should return a generic error when the action fails", async () => {
      mockedDeleteExecute.mockRejectedValue(new Error("UNKNOWN"));

      const promptId = "1";
      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to remove prompt.");
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("getPromptsAction", () => {
    it("should return all prompts", async () => {
      const prompts = [
        { id: "1", title: "Prompt A", content: "Content A" },
        { id: "2", title: "Prompt B", content: "Content B" }
      ];

      mockedFindMany.mockResolvedValue(prompts);

      const result = await getPromptsAction();

      expect(result).toEqual(prompts);
    });

    it("should return an empty array when there are no prompts", async () => {
      mockedFindMany.mockResolvedValue([]);

      const result = await getPromptsAction();

      expect(result).toEqual([]);
    });
  });
});
