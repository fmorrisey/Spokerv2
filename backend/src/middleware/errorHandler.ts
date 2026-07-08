import { Request, Response, NextFunction } from "express";
import { reportError } from "../services/error.service";

export function errorHandler(
    error: any,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    // Show stack traces in non-production environments for easier debugging
    const stack = process.env.NODE_ENV === "production" ? null : error.stack;

    // Hand the error off to the reporting boundary (local sink today; a
    // dedicated error-processing microservice later).
    reportError(error, { path: req.path, method: req.method });

    res.status(statusCode).json({
        status: statusCode === 500 ? "error" : "fail",
        error: message,
        stack: stack,
        timestamp: new Date().toISOString(),
    })

}
