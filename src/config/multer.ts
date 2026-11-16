import multer from "multer";

export class InvalidFileTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileTypeError";
  }
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new InvalidFileTypeError(
          "Invalid file type. Only images, PDFs, Word documents, Excel spreadsheets, and PowerPoint presentations are allowed.",
        ),
      );
    }
  },
});

const uploadMiddleware = upload.single("file");

export default uploadMiddleware;
