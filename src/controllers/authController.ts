import { Request, Response } from "express";
import { RowDataPacket, QueryError } from "mysql2";
import { loginFormScheme, registerFormScheme } from "../schemas";
import { UserRow } from "../types/custom";
import db from "../database";
import * as bcrypt from "bcryptjs";
import * as Joi from "joi";

// add server error code for invalid entry 403

const validateForm = (data: any, schema: Joi.Schema) => {
  const validate: Joi.ValidationResult = schema.validate(data);
  const error: Joi.ValidationError | undefined = validate.error;

  return error;
};

export const checkSession = (req: Request, res: Response): void => {
  if (req.session.user && req.session.user) {
    res.status(200).json({ message: "Session active" });
  } else {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.json({ message: "Error", err });
      }

      res.status(401);
      res.clearCookie("user");
      res.json({ message: "Session expired. Cookie deleted." });
      res.end();
    });
  }
};

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err: any): void => {
    if (err) {
      console.error("Error destroying session:", err);
      res.send(err);
    }

    res.clearCookie("user", { path: "/" });
    res.json({ message: "logout" });
    res.end();
  });
};

export const register = (req: Request, res: Response): void => {
  const validationError = validateForm(req.body, registerFormScheme);

  if (validationError) {
    console.log(validationError);

    const errorMessage = validationError?.details.map((e) => e.message)[0];
    res.json({ message: errorMessage });
    return;
  } else {
    const { username, email, password } = req.body;

    // Check if email is already used
    db.query(
      "SELECT email FROM users WHERE email = ?",
      [email],
      async (
        emailQueryError: QueryError | null,
        emailQueryResults: RowDataPacket[]
      ) => {
        if (emailQueryError) {
          console.error(emailQueryError);

          res.status(Number(emailQueryError.code));

          return;
        } else if (emailQueryResults.length > 0) {
          res.status(410);

          res.json({ message: "Email is already registered!" });

          return;
        }

        // Check if username is already used
        db.query(
          "SELECT username FROM users WHERE username = ?",
          [username],
          async (
            usernameQueryError: QueryError | null,
            usernameQueryResults: RowDataPacket[]
          ) => {
            if (usernameQueryError) {
              console.error(usernameQueryError);
              res.status(Number(usernameQueryError.code));

              return;
            } else if (usernameQueryResults.length > 0) {
              res.status(409);
              res.json({ message: "Username is already registered!" });

              return;
            }

            let hashedPassword = await bcrypt.hash(password, 8);

            db.query(
              "INSERT INTO users SET ?",
              { username: username, email: email, password: hashedPassword },
              (
                newUserQuerError: QueryError | null,
                results: RowDataPacket[]
              ) => {
                if (newUserQuerError) {
                  console.error(newUserQuerError);
                  res.status(Number(newUserQuerError.code));

                  return;
                } else {
                  res.status(200);
                  res.json({ message: "User successfully registered!" });

                  console.log("User successfully registered!");

                  return;
                }
              }
            );
          }
        );
      }
    );
  }
};

export const login = (req: Request, res: Response): void => {
  const validationError = validateForm(req.body, loginFormScheme);

  if (validationError) {
    // Wrong credentials from client
    res.status(400);
    res.json({ message: "Missing username or password" });
    return;
  } else {
    const { username, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err: QueryError | null, results: UserRow[]) => {
        if (err) {
          // Query error, server side
          // res.json({messsage: err.message})
          res.status(500);
          return;
        } else {
          if (results.length > 0) {
            // To check
            const users = results.map((row) => ({
              hashedPassword: row.password,
            }));

            bcrypt.compare(
              password,
              users[0].hashedPassword,
              (err: Error | null, comparison: boolean) => {
                if (err) {
                  // Password with hash compare error, server side
                  console.log(err);

                  res.status(500);
                  res.json({ message: err?.message });

                  return;
                } else if (comparison) {
                  // Create session
                  console.log(JSON.stringify(req.session));
                  req.session.user = results;

                  // Name of user of loged in session
                  const sessionUsername = req.session.user[0].username;

                  res.status(200);
                  res.json({ username: sessionUsername });

                  return;
                } else {
                  // Wrong password
                  res.status(401);
                  res.json({ message: "Unauthorized. Wrong credentials." });

                  return;
                }
              }
            );
          } else {
            // Wrong username
            res.status(401);
            res.json({ message: "Unauthorized. Wrong credentials." });
            return;
          }
        }
      }
    );
  }
};
