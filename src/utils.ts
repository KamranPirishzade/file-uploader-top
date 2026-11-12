import { Prisma } from "./generated/prisma/client.ts";

const MAX_POSTGRES_INTEGER = 2147483647;

function isUniqueValidationError(error: any): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function parseId(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const id = Number(value);
  return id > 0 && id <= MAX_POSTGRES_INTEGER ? id : undefined;
}

export { isUniqueValidationError, parseId };
