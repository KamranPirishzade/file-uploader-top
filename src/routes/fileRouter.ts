import { Router } from "express";
import fileController from "../controllers/fileController.ts";
import { requireLogin } from "../controllers/authController.ts";

const fileRouter = Router();

fileRouter.use(requireLogin);
fileRouter.get("/:id", fileController.loadFile, fileController.getFile);
fileRouter.post(
  "/:id/delete",
  fileController.loadFile,
  fileController.postDeleteFile,
);
fileRouter.get(
  "/:id/download",
  fileController.loadFile,
  fileController.getFileDownload,
);

export default fileRouter;
