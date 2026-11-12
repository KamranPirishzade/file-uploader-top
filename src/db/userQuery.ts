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

export default { createUser };
