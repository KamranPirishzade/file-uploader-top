import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

export default prisma;
