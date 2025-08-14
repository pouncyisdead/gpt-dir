import { globToRegExp } from "@std/path";
import { join } from "@std/path";

export interface Ignore {
  match(path: string): boolean;
}

export function loadIgnores(baseDir: string, extraGlobs: string[]): Ignore {
  const patterns: RegExp[] = [];
  // Read .gptdirignore if present
  try {
    const ignorePath = join(baseDir, ".gptdirignore");
    const data = Deno.readTextFileSync(ignorePath);
    for (const raw of data.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      patterns.push(globToRegExp(line, { extended: true, globstar: true }));
    }
  } catch {
    // Needs a comment...
  }

  for (const g of extraGlobs) {
    patterns.push(globToRegExp(g, { extended: true, globstar: true }));
  }

  return {
    match(path: string): boolean {
      return patterns.some((re) => re.test(path));
    },
  };
}
