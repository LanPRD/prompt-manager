import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

test("Update prompt by UI (success)", async ({ page }) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const now = new Date();
  const originalTitle = `Test Prompt ${now.toISOString()}`;
  const updatedTitle = `Updated Test Prompt ${now.toISOString()}`;
  const content = "This is a test prompt.";

  const created = await prisma.prompt.create({
    data: {
      title: originalTitle,
      content: "This is a test prompt."
    }
  });

  try {
    await page.goto(`/${created.id}`);

    await expect(page.getByPlaceholder("Título do prompt")).toBeVisible();

    await page.fill("input[name='title']", updatedTitle);
    await page.fill("textarea[name='content']", content);

    await page.getByRole("button", { name: "Salvar" }).click();

    await page.waitForSelector("text=Prompt updated successfully.", {
      timeout: 10000,
      state: "visible"
    });

    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
    await expect(page.locator("textarea[name='content']")).toHaveValue(content);
  } finally {
    await prisma.prompt.deleteMany({ where: { id: created.id } });
    await prisma.$disconnect();
  }
});
