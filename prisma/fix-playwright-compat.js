/**
 * Workaround for Prisma 7 + Playwright compatibility issue
 * @see https://github.com/prisma/prisma/issues/28838
 *
 * Prisma 7 generates a line that breaks Playwright's ESM detection:
 * globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))
 *
 * This script comments out that line after prisma generate.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const clientPath = resolve(import.meta.dirname, "generated/client.ts");

const content = readFileSync(clientPath, "utf-8");
const fixed = content.replace(
  /^(globalThis\['__dirname'\].*)$/m,
  "// $1 // Commented out for Playwright compatibility"
);

if (content !== fixed) {
  writeFileSync(clientPath, fixed);
  console.log("[fix-playwright-compat] Patched prisma/generated/client.ts");
} else {
  console.log("[fix-playwright-compat] No changes needed");
}
