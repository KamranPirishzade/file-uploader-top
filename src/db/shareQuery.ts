import prisma from "./prisma.ts";

async function addShareLink({
  folderId,
  expiresAt,
}: {
  folderId: number;
  expiresAt: Date;
}) {
  return await prisma.shareLink.create({
    data: {
      folderId,
      expiresAt,
    },
  });
}

async function getFolderByShareId(shareId: string) {
  return await prisma.shareLink.findUnique({
    where: { id: shareId, expiresAt: { gt: new Date() } },
    include: {
      folder: { include: { files: true } },
    },
  });
}

async function getFileByShareId({
  shareId,
  fileId,
}: {
  shareId: string;
  fileId: number;
}) {
  return await prisma.file.findUnique({
    where: {
      id: fileId,
      folder: {
        shareLinks: { some: { id: shareId, expiresAt: { gt: new Date() } } },
      },
    },
  });
}

export default {
  addShareLink,
  getFolderByShareId,
  getFileByShareId,
};
