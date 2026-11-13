import { matchedData, body, validationResult } from "express-validator";
import folderQuery from "../db/folderQuery.ts";
import type { NextFunction, Request, Response } from "express";
import { isUniqueValidationError, parseId } from "../utils.ts";
import fileQuery from "../db/fileQuery.ts";

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
  await folderQuery.deleteFolderById({
    folderId: req.folder!.id,
    userId: req.user!.id,
  });
  res.redirect("/");
}

async function getFolder(req: Request, res: Response) {
  res.render("folder", { folder: req.folder!, errors: [], data: {} });
}

async function postUploadFile(req: Request, res: Response) {
  if (!req.file) {
    res.render("folder", {
      folder: req.folder!,
      errors: [{ msg: "No file uploaded" }],
      data: {},
    });
    return;
  }
  await fileQuery.addFileToFolder({
    folderId: req.folder!.id,
    userId: req.user!.id,
    originalName: req.file.originalname,
    storagePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
  res.redirect(`/folders/${req.folder!.id}`);
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
};
