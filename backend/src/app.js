import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Importing routes
import userRouter from "./routes/user.routes.js";
// Routes declaration
app.use("/api/v1/users", userRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || (typeof err.code === 'number' && err.code >= 400 && err.code < 600 ? err.code : 500);
    let message = err.message || "Internal Server Error";

    if (err.code === 11000) {
        statusCode = 400;
        const keys = Object.keys(err.keyValue || {});
        message = keys.length ? `An account with this ${keys.join(', ')} already exists.` : "Duplicate entry found in database.";
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});

export { app };
