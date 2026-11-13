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

export default { addFileToFolder };
