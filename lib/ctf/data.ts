import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { CtfDetail, CtfIndex } from "./types";

const DATA_DIR = join(process.cwd(), "data", "generated");

export async function getCtfIndex(): Promise<CtfIndex> {
  return JSON.parse(await readFile(join(DATA_DIR, "index.json"), "utf8")) as CtfIndex;
}

export async function getCtfDetail(slug: string): Promise<CtfDetail | null> {
  if (!/^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(slug)) return null;
  try {
    return JSON.parse(await readFile(join(DATA_DIR, "ctfs", `${slug}.json`), "utf8")) as CtfDetail;
  } catch {
    return null;
  }
}

