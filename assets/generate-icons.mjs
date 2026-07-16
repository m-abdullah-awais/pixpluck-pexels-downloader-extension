/*
 * Dev-only icon generator for PixPluck.
 * Rasterizes assets/logo.master.svg into the PNG sizes the manifest needs.
 * This is NOT part of the shipped extension. Run it once with:
 *
 *   npm install
 *   node assets/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const svg = readFileSync(join(here, "logo.master.svg"));
const sizes = [16, 32, 48, 128];

mkdirSync(join(root, "icons"), { recursive: true });

for (const size of sizes) {
  const out = join(root, "icons", `icon${size}.png`);
  await sharp(svg, { density: 512 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`wrote icons/icon${size}.png`);
}

console.log("Done. Icons regenerated from logo.master.svg");
