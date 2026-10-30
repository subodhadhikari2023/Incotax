import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Checks on project files (not app behaviour): self-hosted assets and the Netlify build settings.
const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe("self-hosted assets", () => {
  const files = sourceFiles(join(root, "src"));

  it("loads fonts from installed packages, not from Google", () => {
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toContain("next/font/google");
    }
  });

  it("references no CDN or font service", () => {
    const cdn = /https?:\/\/(fonts\.googleapis|fonts\.gstatic|cdn\.|unpkg\.com|kit\.fontawesome)/;
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(cdn);
    }
  });
});

describe("netlify.toml", () => {
  it("builds with npm run build on the same Node major as .nvmrc", () => {
    const toml = read("netlify.toml");
    expect(toml).toContain('command = "npm run build"');
    expect(toml).toContain(`NODE_VERSION = "${read(".nvmrc").trim()}"`);
  });
});
