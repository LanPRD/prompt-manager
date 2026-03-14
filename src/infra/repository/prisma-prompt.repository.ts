import type { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository";
import type { PrismaClient } from "../../../prisma/generated/client";

export class PrismaPromptRepository implements PromptRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
