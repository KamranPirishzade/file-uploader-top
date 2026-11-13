import type { NextFunction, Request, Response } from "express";
import fileQuery from "../db/fileQuery.ts";
import { parseId } from "../utils.ts";
import { unlink } from "node:fs/promises";

async function loadFile(req: Request, res: Response, next: NextFunction) {
  const fileId = parseId(req.params.id);
  if (fileId == null) {
    res.status(400).send("Invalid file ID");
    return;
  }
  const file = await fileQuery.getFileById({
    id: fileId,
    userId: req.user!.id,
  });
  if (!file) {
    res.status(404).send("File not found");
    return;
  }
  req.storedFile = file;
  next();
}

async function getFile(req: Request, res: Response) {
  res.render("file", {
    file: req.storedFile!,
    errors: [],
    data: {},
  });
}

async function postDeleteFile(req: Request, res: Response) {
  await fileQuery.deleteFileById({
    id: req.storedFile!.id,
    userId: req.user!.id,
  });
  try {
    await unlink(req.storedFile!.storagePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") console.error(err);
  }
  res.redirect(`/folders/${req.storedFile!.folderId}`);
}

async function getFileDownload(req: Request, res: Response) {
  res.download(req.storedFile!.storagePath, req.storedFile!.originalName);
}

export default { getFile, loadFile, postDeleteFile, getFileDownload };
