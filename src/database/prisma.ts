import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { logError, logInfo } from "../utils/logger.js";

export const prisma = new PrismaClient();

// Some hosts (e.g. Railway) can ignore configured start commands, so the
// schema is pushed here to guarantee it runs regardless of how the
// container was launched.
export function applyDatabaseSchema() {
  try {
    logInfo("Applying Prisma schema to the database.");
    execFileSync("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"], {
      stdio: "inherit",
      env: process.env
    });
  } catch (error) {
    logError("Failed to apply Prisma schema.", error);
    throw error;
  }
}

export async function connectPostgres() {
  try {
    await prisma.$connect();
    logInfo("PostgreSQL connected.");
  } catch (error) {
    logError("PostgreSQL connection error.", error);
    throw error;
  }
}

export async function closePostgresConnection() {
  await prisma.$disconnect();
}