import { matchedData, validationResult, body } from "express-validator";
import bcrypt from "bcryptjs";
import userQuery from "../db/userQuery.ts";

import type { Request, Response } from "express";
import { isUniqueValidationError } from "../utils.ts";

const signupValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .toLowerCase()
    .withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters long"),
  body("surname")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Surname must be between 2 and 100 characters long"),
];

function getSignup(req: Request, res: Response) {
  res.render("signup", { errors: [], data: {} });
}

async function postSignup(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("signup", { errors: errors.array(), data: req.body });
    return;
  }
  const { email, password, name, surname } = matchedData(req);
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await userQuery.createUser({
      email,
      hashedPassword,
      name,
      surname,
    });
    res.redirect("/login");
  } catch (error) {
    if (isUniqueValidationError(error)) {
      res.render("signup", {
        errors: [{ msg: "Email already exists" }],
        data: req.body,
      });
      return;
    }
    throw error;
  }
}

export default { getSignup, postSignup, signupValidation };
