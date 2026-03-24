import type { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";
import type { PrismaClient } from "../../../prisma/generated/client";
import type { CreatePromptDto } from "@/core/application/prompts/create-prompt.dto";

export class PrismaPromptRepository implements PromptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTitle(title: string): Promise<PromptSummary | null> {
    const prompt = await this.prisma.prompt.findFirst({
      where: { title }
    });

    return prompt;
  }

  async create(data: CreatePromptDto): Promise<void> {
    await this.prisma.prompt.create({
      data: data
    });
  }

  async findMany(): Promise<PromptSummary[]> {
    const prompts = await this.prisma.prompt.findMany({
      orderBy: { createdAt: "desc" }
    });

    return prompts;
  }

  async searchMany(searchTerm: string): Promise<PromptSummary[]> {
    const prompts = await this.prisma.prompt.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    return prompts;
  }
}
