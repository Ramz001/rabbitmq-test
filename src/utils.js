import fs from "fs/promises";

export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error("Failed to create directory:", err);
    throw err;
  }
}

export function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]+/g, "_");
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
