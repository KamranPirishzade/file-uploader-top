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

function bytesToSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}

export { isUniqueValidationError, parseId, bytesToSize };
