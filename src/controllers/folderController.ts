import { matchedData, body, validationResult } from "express-validator";
import folderQuery from "../db/folderQuery.ts";
import type { Request, Response } from "express";
import { isUniqueValidationError, parseId } from "../utils.ts";

const folderValidation = [
  body("folderName")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required")
    .isLength({ max: 100 })
    .withMessage("Folder name must be at most 100 characters long"),
];

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
  res.render("editFolder", { folder, errors: [], data: {} });
}

async function postUpdateFolder(req: Request, res: Response) {
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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("editFolder", {
      errors: errors.array(),
      data: req.body,
      folder: folder,
    });
    return;
  }

  const { folderName } = matchedData(req);
  try {
    await folderQuery.updateFolderById({
      folderId,
      folderName,
      userId: req.user!.id,
    });
    res.redirect("/");
  } catch (error) {
    if (isUniqueValidationError(error)) {
      res.render("editFolder", {
        errors: [{ msg: "Folder name already exists" }],
        data: req.body,
        folder: folder,
      });
      return;
    }
    throw error;
  }
}

export default {
  folderValidation,
  postCreateFolder,
  getEditFolder,
  postUpdateFolder,
};
