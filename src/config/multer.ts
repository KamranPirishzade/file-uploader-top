import multer from "multer";
import path from "node:path";

const upload = multer({
  dest: path.join(import.meta.dirname, "..", "..", "uploads"),
});

const uploadMiddleware = upload.single("file");

export default uploadMiddleware;
