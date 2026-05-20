import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

test("Create prompt (success)", async ({ page }) => {
  const uniqueTitle = `Test Prompt ${new Date().toISOString()}`;
  const content = "This is a test prompt.";

  await page.goto("/new");
  await expect(page.getByPlaceholder("Título do prompt")).toBeVisible();
  await page.fill("input[name='title']", uniqueTitle);
  await page.fill("textarea[name='content']", content);
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.waitForSelector("text=Prompt created successfully.", {
    timeout: 15000,
    state: "visible"
  });
});

test("Cannot duplicate prompt title", async ({ page }) => {
  const uniqueTitle = `Test Prompt ${new Date().toISOString()}`;
  const content = "This is a test prompt.";

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  await prisma.prompt.deleteMany({
    where: { title: uniqueTitle }
  });

  await prisma.prompt.create({
    data: { title: uniqueTitle, content }
  });

  await prisma.$disconnect();

  await page.goto("/new");
  await page.fill("input[name='title']", uniqueTitle);
  await page.fill("textarea[name='content']", content);
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.waitForSelector("text=A prompt with the same title already exists.", {
    timeout: 15000,
    state: "visible"
  });

  await expect(page.getByRole("heading", { name: uniqueTitle })).toHaveCount(1);
});
