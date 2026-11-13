import prisma from "../db/prisma.ts";

function addFileToFolder({
  folderId,
  originalName,
  storagePath,
  userId,
  mimeType,
  size,
}: {
  folderId: number;
  originalName: string;
  storagePath: string;
  userId: number;
  mimeType: string;
  size: number;
}) {
  return prisma.file.create({
    data: {
      folderId,
      originalName,
      storagePath,
      userId,
      mimeType,
      size,
    },
  });
}

async function getFilesByFolderId({
  folderId,
  userId,
}: {
  folderId: number;
  userId: number;
}) {
  return await prisma.file.findMany({
    where: { folderId, userId },
    orderBy: { createdAt: "desc" },
  });
}

async function getFileById({ id, userId }: { id: number; userId: number }) {
  return await prisma.file.findUnique({
    where: { id, userId },
  });
}

async function deleteFileById({ id, userId }: { id: number; userId: number }) {
  return await prisma.file.deleteMany({
    where: { id, userId },
  });
}

export default {
  addFileToFolder,
  getFilesByFolderId,
  getFileById,
  deleteFileById,
};
