import { Router } from "express";
import folderController from "../controllers/folderController.ts";
import { requireLogin } from "../controllers/authController.ts";
import uploadMiddleware from "../config/multer.ts";

const folderRouter = Router();

folderRouter.use(requireLogin);

folderRouter.post(
  "/create",
  folderController.folderValidation,
  folderController.postCreateFolder,
);
folderRouter.get(
  "/:id",
  folderController.loadFolder,
  folderController.getFolder,
);
folderRouter.get(
  "/:id/edit",
  folderController.loadFolder,
  folderController.getEditFolder,
);
folderRouter.post(
  "/:id/edit",
  folderController.loadFolder,
  folderController.folderValidation,
  folderController.postUpdateFolder,
);
folderRouter.post(
  "/:id/delete",
  folderController.loadFolder,
  folderController.postDeleteFolder,
);
folderRouter.post(
  "/:id/upload",
  folderController.loadFolder,
  uploadMiddleware,
  folderController.postUploadFile,
);

export default folderRouter;
