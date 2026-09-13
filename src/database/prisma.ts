import { PrismaClient } from "@prisma/client";
import { logError, logInfo } from "../utils/logger.js";

export const prisma = new PrismaClient();

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