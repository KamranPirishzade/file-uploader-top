import express from "express";
import path from "node:path";
import authRouter from "./routes/authRouter.ts";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import expressSession from "express-session";
import prisma from "./db/prisma.ts";
import passport from "passport";
import "./config/passport.ts";
import folderQuery from "./db/folderQuery.ts";
import folderRouter from "./routes/folderRouter.ts";
import fileRouter from "./routes/fileRouter.ts";
import { bytesToSize } from "./utils.ts";

const dirname = path.join(import.meta.dirname, "..");

const app = express();

app.set("views", path.join(dirname, "views"));
app.set("view engine", "ejs");

app.set("trust proxy", 1);

app.locals.bytesToSize = bytesToSize;

app.use(express.static(path.join(dirname, "public")));

app.use(express.urlencoded({ extended: true }));

if (!process.env.AUTH_SECRET) {
  throw Error("AUTH_SECRET is not defined in the environment variables.");
}
app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    secret: process.env.AUTH_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.session());

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.currentUser = req.user;
    next();
  },
);

app.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.render("index", { folders: [], errors: [], data: {} });
    return;
  }
  const folders = await folderQuery.getFoldersByUserId(req.user!.id);
  res.render("index", { folders, errors: [], data: {} });
});

app.use("/", authRouter);
app.use("/folders", folderRouter);
app.use("/files", fileRouter);

app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).send("500 Internal Server Error");
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Server is running on  http://localhost:${PORT}`);
});
