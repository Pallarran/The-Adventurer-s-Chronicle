import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const input = resolve(root, "Logos.png");

async function main() {
  const meta = await sharp(input).metadata();
  const { width, height } = meta;
  console.log(`Source: ${width}x${height}`);

  const halfHeight = Math.floor(height / 2);

  // Top half — icon only
  const iconBuffer = await sharp(input)
    .extract({ left: 0, top: 0, width, height: halfHeight })
    .png()
    .toBuffer();

  // Trim transparent/dark padding from the icon to get a tight crop
  const trimmed = await sharp(iconBuffer).trim().toBuffer();
  const trimMeta = await sharp(trimmed).metadata();
  console.log(`Icon trimmed: ${trimMeta.width}x${trimMeta.height}`);

  // Save icon-only for sidebar
  await sharp(trimmed)
    .png()
    .toFile(resolve(root, "public", "logo-icon.png"));
  console.log("Saved public/logo-icon.png");

  // Save square favicon (512x512) — pad to square then resize
  const maxDim = Math.max(trimMeta.width, trimMeta.height);
  await sharp(trimmed)
    .resize(maxDim, maxDim, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(512, 512)
    .png()
    .toFile(resolve(root, "src", "app", "icon.png"));
  console.log("Saved src/app/icon.png (512x512 favicon)");

  // Bottom half — full logo + text (trim in two steps to avoid extract_area error)
  const bottomBuffer = await sharp(input)
    .extract({ left: 0, top: halfHeight, width, height: height - halfHeight })
    .png()
    .toBuffer();

  await sharp(bottomBuffer)
    .trim()
    .png()
    .toFile(resolve(root, "public", "logo-full.png"));
  console.log("Saved public/logo-full.png");

  console.log("\nDone! You can now delete Logos.png and the old assets.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
