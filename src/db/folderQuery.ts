import prisma from "./prisma.ts";

async function getFoldersByUserId(userId: number) {
  return await prisma.folder.findMany({
    where: { userId },
    orderBy: {
      name: "asc",
    },
  });
}

async function createFolder({
  userId,
  folderName,
}: {
  userId: number;
  folderName: string;
}) {
  return await prisma.folder.create({
    data: {
      userId,
      name: folderName,
    },
  });
}

async function getFolderById({
  folderId,
  userId,
}: {
  folderId: number;
  userId: number;
}) {
  return await prisma.folder.findFirst({
    where: { id: folderId, userId },
  });
}

async function updateFolderById({
  folderId,
  userId,
  folderName,
}: {
  folderId: number;
  userId: number;
  folderName: string;
}) {
  return await prisma.folder.updateMany({
    where: { id: folderId, userId },
    data: { name: folderName },
  });
}

async function deleteFolderById({
  folderId,
  userId,
}: {
  folderId: number;
  userId: number;
}) {
  return await prisma.folder.deleteMany({
    where: { id: folderId, userId },
  });
}

export default {
  getFoldersByUserId,
  createFolder,
  getFolderById,
  updateFolderById,
  deleteFolderById,
};
