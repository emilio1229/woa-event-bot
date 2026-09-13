import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/** Writes a JSON document without exposing a partially-written destination file. */
export function writeJsonAtomic(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), "utf8");
  fs.renameSync(temporaryPath, filePath);
}
