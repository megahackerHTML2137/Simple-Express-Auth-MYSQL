import express, { Application } from "express";

import * as expressSession from "express-session";
import session from "express-session";
import expressMySqlSession, { type MySQLStore } from "express-mysql-session";

import cors, { CorsOptions } from "cors";

import db from "./database";
import authRouter from "./routes/auth";

// Session & Database
const MySQLStore = expressMySqlSession(expressSession);
const app: Application = express();
const PORT: number = 6969;

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Cors
const options: CorsOptions = {
  origin: ["http://localhost:5173/"],
};
app.use(cors(options));

// Session
const sessionStore: MySQLStore = new MySQLStore(
  {
    checkExpirationInterval: 900000,
    endConnectionOnClose: true,
    clearExpired: true,
  },
  // It should be Connection type from mysql2 but express-mysql-session have some problem
  db as any
);

app.use(
  session({
    name: process.env.SESSION_NAME as string,
    secret: process.env.SESSION_SECRET as string,
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60 * 60 * 10,
      path: "/",
      httpOnly: true,
      //     sameSite: true,
      //     secure: true,
    },
  })
);

// Define Routes
app.use("/auth", authRouter);

// Session storage
sessionStore
  .onReady()
  .then(() => {
    console.log("MySQLStore ready");

    // Start server
    app.listen(PORT, (): void => {
      console.log("Server listening on port:", PORT);
    });
  })
  .catch((error: Error) => {
    console.error(error);
  });
