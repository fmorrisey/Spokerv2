import { Request, Response, NextFunction } from "express";

export function errorHandler(
    error: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error("ERROR OCCURRED :: ", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    // Show stack traces in non-production environments for easier debugging
    const stack = process.env.NODE_ENV === "production" ? null : error.stack;

    res.status(statusCode).json({
        status: statusCode === 500 ? "error" : "fail",
        error: message,
        stack: stack,
        timestamp: new Date().toISOString(),
    })
}
