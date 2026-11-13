import { Router } from "express";
import folderController from "../controllers/folderController.ts";
import { requireLogin } from "../controllers/authController.ts";

const folderRouter = Router();

folderRouter.use(requireLogin);

folderRouter.post(
  "/create",
  folderController.folderValidation,
  folderController.postCreateFolder,
);
folderRouter.get("/:id", folderController.getFolder);
folderRouter.get("/:id/edit", folderController.getEditFolder);
folderRouter.post(
  "/:id/edit",
  folderController.folderValidation,
  folderController.postUpdateFolder,
);
folderRouter.post("/:id/delete", folderController.postDeleteFolder);

export default folderRouter;
