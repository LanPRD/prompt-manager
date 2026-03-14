import z from "zod";

export const createPromptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required")
});

export type CreatePromptDto = z.infer<typeof createPromptSchema>;
