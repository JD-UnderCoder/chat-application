import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const functionsDir = path.join(projectRoot, "functions");

async function rmrf(p) {
  try {
    await fs.rm(p, { recursive: true, force: true });
  } catch {}
}

async function copyDir(src, dest) {
  const stat = await fs.stat(src).catch(() => null);
  if (!stat) return; // nothing to copy
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      const real = await fs.realpath(s);
      await copyDir(real, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

async function main() {
  const nextBuild = path.join(projectRoot, ".next");
  const publicDir = path.join(projectRoot, "public");

  // Ensure functions dir exists
  await fs.mkdir(functionsDir, { recursive: true });

  // Copy .next build output into functions/.next
  const fnNext = path.join(functionsDir, ".next");
  await rmrf(fnNext);
  await copyDir(nextBuild, fnNext);

  // Copy public assets so Next can serve them
  const fnPublic = path.join(functionsDir, "public");
  await rmrf(fnPublic);
  await copyDir(publicDir, fnPublic);

  // Optionally copy next.config.js if present
  const nextConfigJs = path.join(projectRoot, "next.config.js");
  const nextConfigMjs = path.join(projectRoot, "next.config.mjs");
  const nextConfigCjs = path.join(projectRoot, "next.config.cjs");
  const candidates = [nextConfigJs, nextConfigMjs, nextConfigCjs];
  for (const cfg of candidates) {
    try {
      await fs.copyFile(cfg, path.join(functionsDir, path.basename(cfg)));
      break;
    } catch {}
  }

  console.log("Copied Next build to functions/.next and public to functions/public");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
