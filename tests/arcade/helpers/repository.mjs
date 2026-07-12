import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const repositoryRoot = resolve(import.meta.dirname, "../../..");

export function repositoryPath(...parts) {
  return resolve(repositoryRoot, ...parts);
}

export async function readRepositoryFile(...parts) {
  return readFile(repositoryPath(...parts), "utf8");
}

export function countOccurrences(text, pattern) {
  if (pattern instanceof RegExp) {
    return [...text.matchAll(pattern)].length;
  }

  let count = 0;
  let offset = 0;
  while ((offset = text.indexOf(pattern, offset)) !== -1) {
    count += 1;
    offset += pattern.length || 1;
  }
  return count;
}
