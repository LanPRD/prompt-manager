import z from "zod";

export const updatePromptSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required")
});

export type UpdatePromptDto = z.infer<typeof updatePromptSchema>;
