import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

test("Delete prompt via UI (success)", async ({ page }) => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
  });

  const prisma = new PrismaClient({ adapter });

  const uniqueTitle = `E2E Deletable Prompt ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const content = "content";

  await prisma.prompt.create({
    data: {
      title: uniqueTitle,
      content
    }
  });

  try {
    await page.goto("/");

    const list = page.getByRole("list");
    await expect(list).toBeVisible();

    const heading = page.getByRole("heading", { name: uniqueTitle });
    await expect(heading).toBeVisible({ timeout: 15000 });

    const promptItem = page.getByRole("listitem").filter({ hasText: uniqueTitle });
    await expect(promptItem).toBeVisible();

    await promptItem.getByRole("button", { name: "Remover prompt" }).click();

    await page.getByRole("button", { name: "Confirmar remoção" }).click();

    await expect(page.getByText("Prompt removed successfully.")).toBeVisible();
    await expect(page.getByRole("heading", { name: uniqueTitle })).toHaveCount(0, { timeout: 15000 });
  } finally {
    await prisma.prompt.deleteMany({ where: { title: uniqueTitle } });
    await prisma.$disconnect();
  }
});
