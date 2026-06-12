"use server";

import { createPromptSchema, type CreatePromptDto } from "@/core/application/prompts/create-prompt.dto";
import { CreatePromptUseCase } from "@/core/application/prompts/create-prompt.use-case";
import { DeletePromptUseCase } from "@/core/application/prompts/delete-prompt.use-case";
import { SearchPromptsUseCase } from "@/core/application/prompts/search-prompts.use-case";
import { updatePromptSchema, type UpdatePromptDto } from "@/core/application/prompts/update-prompt.dto";
import { UpdatePromptUseCase } from "@/core/application/prompts/update-prompt.use-case";
import type { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import { PrismaPromptRepository } from "@/infra/repository/prisma-prompt.repository";
import { prisma } from "@/lib/prisma";
import z from "zod";

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
  errors?: any;
};

type FormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
  errors?: unknown;
};

export async function createPromptAction(data: CreatePromptDto) {
  const validated = createPromptSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validation failed",
      errors: fieldErrors
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new CreatePromptUseCase(repository);

    await useCase.execute(validated.data);

    return {
      success: true,
      message: "Prompt created successfully."
    };
  } catch (error) {
    const _error = error as Error;

    if (_error.message === "PROMPT_ALREADY_EXISTS") {
      return {
        success: false,
        message: "A prompt with the same title already exists."
      };
    }

    return {
      success: false,
      message: "An error occurred while creating the prompt."
    };
  }
}

export async function getPromptsAction(): Promise<PromptSummary[]> {
  const repository = new PrismaPromptRepository(prisma);
  return repository.findMany();
}

export async function searchPromptAction(_prev: SearchFormState, formData: FormData): Promise<SearchFormState> {
  const term = String(formData.get("q") ?? "").trim();

  const repository = new PrismaPromptRepository(prisma);
  const useCase = new SearchPromptsUseCase(repository);

  try {
    const result = await useCase.execute(term);

    const summaries = result.map(({ id, title, content }) => ({
      id,
      title,
      content
    }));

    return {
      success: true,
      prompts: summaries
    };
  } catch (error) {
    console.error("Error searching for prompts:", error);

    return {
      success: false,
      message: "An error occurred while searching for prompts."
    };
  }
}

export async function updatePromptAction(data: UpdatePromptDto): Promise<FormState> {
  const validated = updatePromptSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: "Validation error",
      errors: fieldErrors
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new UpdatePromptUseCase(repository);
    await useCase.execute(validated.data);

    return {
      success: true,
      message: "Prompt updated successfully."
    };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === "PROMPT_NOT_FOUND") {
      return {
        success: false,
        message: "Prompt not found"
      };
    }

    return {
      success: false,
      message: "Failed to update prompt."
    };
  }
}

export async function deletePromptAction(id: string): Promise<FormState> {
  if (!id) {
    return { success: false, message: "Prompt ID is required." };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new DeletePromptUseCase(repository);
    await useCase.execute(id);

    return {
      success: true,
      message: "Prompt removed successfully."
    };
  } catch (error) {
    const _error = error as Error;

    if (_error.message === "PROMPT_NOT_FOUND") {
      return {
        success: false,
        message: "Prompt not found."
      };
    }

    return {
      success: false,
      message: "Failed to remove prompt."
    };
  }
}
