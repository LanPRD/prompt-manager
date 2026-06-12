import type { CreatePromptDto } from "@/core/application/prompts/create-prompt.dto";
import type { UpdatePromptDto } from "@/core/application/prompts/update-prompt.dto";
import { Prompt } from "@/core/domain/prompts/prompt.entity";
import { PrismaPromptRepository } from "@/infra/repository/prisma-prompt.repository";
import type { PrismaClient } from "../../../prisma/generated/client";

type PromptDelegateMock = {
  create: jest.MockedFunction<(args: { data: CreatePromptDto }) => Promise<void>>;
  update: jest.MockedFunction<(args: { where: { id: string }; data: UpdatePromptDto }) => Promise<Prompt>>;
  findUnique: jest.MockedFunction<(args: { where: { id: string } }) => Promise<Prompt | null>>;
  findFirst: jest.MockedFunction<
    (args: { where: { title: string } }) => Promise<Pick<Prompt, "id" | "title" | "content"> | null>
  >;
  delete: jest.MockedFunction<(args: { where: { id: string } }) => Promise<void>>;
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: "asc" | "desc" };
      where?: {
        OR: Array<{
          title?: { contains: string; mode: "insensitive" };
          content?: { contains: string; mode: "insensitive" };
        }>;
      };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn()
    }
  };

  return mock as unknown as PrismaClient & PrismaMock;
}

describe("PrismaPromptRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
  });

  describe("create", () => {
    it("should call the create method with the correct data", async () => {
      const input = {
        title: "title",
        content: "content"
      };

      await repository.create(input);

      expect(prisma.prompt.create).toHaveBeenCalledWith({
        data: input
      });
    });
  });

  describe("update", () => {
    it("should update and return the prompt", async () => {
      const now = new Date();

      const input = {
        id: "1",
        title: "new title",
        content: "new content",
        createdAt: now,
        updatedAt: now
      };

      prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        title: input.title,
        content: input.content
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: {
          id: input.id
        },
        data: {
          title: input.title,
          content: input.content
        }
      });

      expect(result).toEqual(input);
    });

    it("should send only the present fields (e.g., title only)", async () => {
      const now = new Date();

      const input = {
        id: "1",
        title: "new title",
        content: "",
        createdAt: now,
        updatedAt: now
      };

      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, {
        title: input.title
      });

      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ title: input.title });
      expect("content" in call.data).toBe(false);
    });

    it("should send only the present fields (e.g., content only)", async () => {
      const now = new Date();

      const input = {
        id: "1",
        title: "",
        content: "new content",
        createdAt: now,
        updatedAt: now
      };

      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, {
        content: input.content
      });

      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ content: input.content });

      expect("title" in call.data).toBe(false);
    });
  });

  describe("delete", () => {
    it("should call the delete method with the correct id", async () => {
      const promptId = "1";
      await repository.delete(promptId);

      expect(prisma.prompt.delete).toHaveBeenCalledWith({
        where: {
          id: promptId
        }
      });
    });
  });

  describe("findByTitle", () => {
    it("should call the findFirst method with the correct title", async () => {
      const title = "title 01";

      const input = {
        id: "p1",
        title,
        content: "content 01"
      };

      prisma.prompt.findFirst.mockResolvedValue(input);

      const result = await repository.findByTitle(title);

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: {
          title
        }
      });
      expect(result).toEqual(input);
    });
  });

  describe("findById", () => {
    it("should return a Prompt when it exists", async () => {
      const now = new Date();

      const input = {
        id: "1",
        title: "title",
        content: "content",
        createdAt: now,
        updatedAt: now
      };

      prisma.prompt.findUnique.mockResolvedValue(input);

      const result = await repository.findById(input.id);

      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({
        where: {
          id: input.id
        }
      });
      expect(result).toEqual(input);
    });

    it("should return null when a prompt does not exist", async () => {
      prisma.prompt.findUnique.mockResolvedValue(null);

      const result = await repository.findById("1");

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    it("should order by createdAt desc and map the results", async () => {
      const now = new Date();

      const input = [
        {
          id: "1",
          title: "Title 01",
          content: "Content 01",
          createdAt: now,
          updatedAt: now
        },
        {
          id: "2",
          title: "Title 02",
          content: "Content 02",
          createdAt: now,
          updatedAt: now
        }
      ];

      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" }
      });

      expect(results).toMatchObject(input);
    });
  });

  describe("searchMany", () => {
    it("should search for an empty term and not send the where clause", async () => {
      const now = new Date();

      const input = [
        {
          id: "1",
          title: "Title 01",
          content: "Content 01",
          createdAt: now,
          updatedAt: now
        }
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany("    ");

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: "desc" }
      });

      expect(results).toMatchObject(input);
    });

    it("should search for a term and populate the OR clause in the where condition", async () => {
      const now = new Date();

      const input = [
        {
          id: "1",
          title: "Title 01",
          content: "Content 01",
          createdAt: now,
          updatedAt: now
        }
      ];

      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany("  title 01  ");

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: "title 01", mode: "insensitive" } },
            { content: { contains: "title 01", mode: "insensitive" } }
          ]
        },
        orderBy: { createdAt: "desc" }
      });

      expect(results).toMatchObject(input);
    });

    it("should accept an undefined term and not send the where clause", async () => {
      const now = new Date();

      const input = [
        {
          id: "1",
          title: "Title 01",
          content: "Content 01",
          createdAt: now,
          updatedAt: now
        }
      ];

      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany(undefined);

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: "desc" }
      });

      expect(results).toMatchObject(input);
    });
  });
});
