import express from "express";
import path from "node:path";

const dirname = path.join(import.meta.dirname, "..");

const app = express();

app.set("views", path.join(dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

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
