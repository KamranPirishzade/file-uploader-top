import { Router } from "express";
import shareController from "../controllers/shareController.ts";

const shareRouter = Router();

shareRouter.get("/:id", shareController.getSharedFolder);
shareRouter.get(
  "/:id/files/:fileId/download",
  shareController.getShareLinkDownload,
);

export default shareRouter;
