import type { Request, Response } from "express";
import shareQuery from "../db/shareQuery.ts";
import { parseId } from "../utils.ts";
import { getDownloadUrl } from "../config/supabase.ts";

async function getSharedFolder(req: Request, res: Response) {
  if (typeof req.params.id !== "string") {
    res.status(400).send("Invalid request");
    return;
  }
  const shareId = req.params.id;
  const folder = await shareQuery.getFolderByShareId(shareId);
  if (!folder) {
    res.status(404).send("Shared folder not found");
    return;
  }
  res.render("sharedFolder", {
    folder: folder.folder,
    files: folder.folder.files,
    shareId: shareId,
    errors: [],
    data: {},
  });
}

async function getShareLinkDownload(req: Request, res: Response) {
  if (typeof req.params.id !== "string") {
    res.status(400).send("Invalid request");
    return;
  }

  const shareId = req.params.id;
  const fileId = parseId(req.params.fileId);
  if (fileId == null) {
    res.status(400).send("Invalid file ID");
    return;
  }

  const file = await shareQuery.getFileByShareId({ shareId, fileId });
  if (!file) {
    res.status(404).send("File not found");
    return;
  }

  const url = await getDownloadUrl(file.storagePath, file.originalName);
  res.redirect(url);
}

export default { getSharedFolder, getShareLinkDownload };
