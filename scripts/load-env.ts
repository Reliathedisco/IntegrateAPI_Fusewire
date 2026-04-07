import fs from "fs";
import * as path from "path";

/**
 * Loads `.env.local` then `.env` into `process.env` (without overriding existing vars).
 * Next.js does this for `next dev` / `next build`; plain `jiti` scripts do not.
 */
export function loadEnvFiles(): void {
  const root = path.join(__dirname, "..");
  for (const name of [".env.local", ".env"] as const) {
    const full = path.join(root, name);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.replace(/^\uFEFF/, "").trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}
