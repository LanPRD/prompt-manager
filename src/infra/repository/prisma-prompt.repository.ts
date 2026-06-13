import type { CreatePromptDto } from "@/core/application/prompts/create-prompt.dto";
import type { Prompt } from "@/core/domain/prompts/prompt.entity";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";
import type { PrismaClient } from "../../../prisma/generated/client";

export class PrismaPromptRepository implements PromptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(id: string, data: Partial<CreatePromptDto>): Promise<Prompt> {
    const updated = await this.prisma.prompt.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {})
      }
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.prompt.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id }
    });

    return prompt;
  }

  async findByTitle(title: string): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findFirst({
      where: { title }
    });

    return prompt;
  }

  async create(data: CreatePromptDto): Promise<Prompt> {
    return this.prisma.prompt.create({
      data: data
    });
  }

  async findMany(): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      orderBy: { createdAt: "desc" }
    });

    return prompts;
  }

  async searchMany(term?: string): Promise<Prompt[]> {
    const q = term?.trim() ?? "";

    const prompts = await this.prisma.prompt.findMany({
      where:
        q ?
          {
            OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }]
          }
        : undefined,
      orderBy: { createdAt: "desc" }
    });
    return prompts;
  }
}
