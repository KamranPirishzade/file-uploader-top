import prisma from "./prisma.ts";

interface CreateUserParams {
  email: string;
  hashedPassword: string;
  name: string;
  surname: string;
}

async function createUser({
  email,
  hashedPassword,
  name,
  surname,
}: CreateUserParams) {
  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword,
      name,
      surname,
    },
  });
  return user;
}

async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}

async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id: id },
    omit: { hashedPassword: true },
  });
  return user;
}

export default { createUser, getUserByEmail, getUserById };
