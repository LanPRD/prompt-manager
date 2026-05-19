import { config as dotenvConfig } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { seedDatabase } from "../../prisma/seed";

async function globalSetup() {
  if (!process.env.CI) {
    const root = process.cwd();
    const envPath = resolve(root, ".env");
    const envExamplePath = resolve(root, ".env.example");

    if (existsSync(envPath)) {
      dotenvConfig({ path: envPath });
    } else if (existsSync(envExamplePath)) {
      dotenvConfig({ path: envExamplePath });
    }

    const url = process.env.DATABASE_URL;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      console.error("Missing or invalid DATABASE_URL environment variable.");
      return;
    }

    try {
      await seedDatabase();
    } catch (error) {
      const _error = error as Error;
      console.error("[E2E] seedDatabase failed:", _error.message);
    }
  }
}

export default globalSetup;
