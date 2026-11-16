import { matchedData, body, validationResult } from "express-validator";
import folderQuery from "../db/folderQuery.ts";
import type { NextFunction, Request, Response } from "express";
import { isUniqueValidationError, parseId } from "../utils.ts";
import fileQuery from "../db/fileQuery.ts";
import supabase from "../config/supabase.ts";
import { randomUUID } from "node:crypto";
import { MulterError } from "multer";
import { InvalidFileTypeError } from "../config/multer.ts";

const folderValidation = [
  body("folderName")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required")
    .isLength({ max: 100 })
    .withMessage("Folder name must be at most 100 characters long"),
];

async function loadFolder(req: Request, res: Response, next: NextFunction) {
  const folderId = parseId(req.params.id);
  if (folderId == null) {
    res.status(400).send("Invalid folder ID");
    return;
  }
  const folder = await folderQuery.getFolderById({
    folderId,
    userId: req.user!.id,
  });
  if (!folder) {
    res.status(404).send("Folder not found");
    return;
  }
  req.folder = folder;
  next();
}

async function postCreateFolder(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const folders = await folderQuery.getFoldersByUserId(req.user!.id);
    res.render("index", {
      folders: folders,
      errors: errors.array(),
      data: req.body,
    });
    return;
  }
  const { folderName } = matchedData(req);

  try {
    await folderQuery.createFolder({ folderName, userId: req.user!.id });
    res.redirect("/");
  } catch (error) {
    if (isUniqueValidationError(error)) {
      const folders = await folderQuery.getFoldersByUserId(req.user!.id);
      res.render("index", {
        folders: folders,
        errors: [{ msg: "Folder name already exists" }],
        data: req.body,
      });
      return;
    }
    throw error;
  }
}

async function getEditFolder(req: Request, res: Response) {
  res.render("editFolder", { folder: req.folder!, errors: [], data: {} });
}

async function postUpdateFolder(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("editFolder", {
      errors: errors.array(),
      data: req.body,
      folder: req.folder!,
    });
    return;
  }

  const { folderName } = matchedData(req);
  try {
    await folderQuery.updateFolderById({
      folderId: req.folder!.id,
      folderName,
      userId: req.user!.id,
    });
    res.redirect("/");
  } catch (error) {
    if (isUniqueValidationError(error)) {
      res.render("editFolder", {
        errors: [{ msg: "Folder name already exists" }],
        data: req.body,
        folder: req.folder!,
      });
      return;
    }
    throw error;
  }
}

async function postDeleteFolder(req: Request, res: Response) {
  const files = await fileQuery.getFilesByFolderId({
    folderId: req.folder!.id,
    userId: req.user!.id,
  });

  await folderQuery.deleteFolderById({
    folderId: req.folder!.id,
    userId: req.user!.id,
  });

  if (files.length > 0) {
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET as string)
      .remove(files.map((file) => file.storagePath));

    if (error) {
      console.error("Error deleting files from Supabase storage:", error);
    }
  }

  res.redirect("/");
}

async function getFolder(req: Request, res: Response) {
  const files = await fileQuery.getFilesByFolderId({
    folderId: req.folder!.id,
    userId: req.user!.id,
  });

  res.render("folder", {
    folder: req.folder!,
    errors: [],
    data: {},
    files,
  });
}

async function postUploadFile(req: Request, res: Response) {
  if (!req.file) {
    const files = await fileQuery.getFilesByFolderId({
      folderId: req.folder!.id,
      userId: req.user!.id,
    });
    res.render("folder", {
      folder: req.folder!,
      files,
      errors: [{ msg: "No file uploaded" }],
      data: {},
    });
    return;
  }
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET as string)
    .upload(`${req.user?.id}/${randomUUID()}`, req.file.buffer, {
      contentType: req.file.mimetype,
    });

  if (error)
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);

  const storagePath = data?.path;
  const originalName = Buffer.from(req.file.originalname, "latin1").toString(
    "utf8",
  );

  try {
    await fileQuery.addFileToFolder({
      folderId: req.folder!.id,
      userId: req.user!.id,
      originalName: originalName,
      storagePath: storagePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
    res.redirect(`/folders/${req.folder!.id}`);
  } catch (error) {
    if (storagePath) {
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET as string)
        .remove([storagePath]);
    }
    throw error;
  }
}

async function handleUploadError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    const files = await fileQuery.getFilesByFolderId({
      folderId: req.folder!.id,
      userId: req.user!.id,
    });
    res.status(400).render("folder", {
      folder: req.folder!,
      errors: [{ msg: "File size exceeds the maximum limit of 10MB" }],
      data: {},
      files: files,
    });
    return;
  }
  if (err instanceof InvalidFileTypeError) {
    const files = await fileQuery.getFilesByFolderId({
      folderId: req.folder!.id,
      userId: req.user!.id,
    });
    res.status(400).render("folder", {
      folder: req.folder!,
      errors: [{ msg: err.message }],
      data: {},
      files: files,
    });
    return;
  }

  next(err);
}

export default {
  folderValidation,
  loadFolder,
  postCreateFolder,
  getEditFolder,
  postUpdateFolder,
  postDeleteFolder,
  getFolder,
  postUploadFile,
  handleUploadError,
};
