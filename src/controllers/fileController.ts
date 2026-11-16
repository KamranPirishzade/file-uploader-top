import type { NextFunction, Request, Response } from "express";
import fileQuery from "../db/fileQuery.ts";
import { parseId } from "../utils.ts";
import supabase from "../config/supabase.ts";

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

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET as string)
    .remove([req.storedFile!.storagePath]);

  if (error) {
    console.error("Error deleting file from Supabase storage:", error);
  }

  res.redirect(`/folders/${req.storedFile!.folderId}`);
}

async function getFileDownload(req: Request, res: Response) {
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET as string)
    .createSignedUrl(req.storedFile!.storagePath, 60);

  if (error) {
    console.error(error);
    res.status(500).send("Error occurred while creating signed URL");
    return;
  }

  res.redirect(
    `${data.signedUrl}&download=${encodeURIComponent(req.storedFile!.originalName)}`,
  );
}

export default { getFile, loadFile, postDeleteFile, getFileDownload };
