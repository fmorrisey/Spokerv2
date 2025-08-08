import express from "express";
import { getAllItems } from "../controllers/item.controller";

const router = express.Router();

/**
 * @openapi
 * /api/v1/items:
 *   get:
 *     summary: Retrieve a list of items
 *     responses:
 *       '200':
 *         description: A list of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */


router.get("/", getAllItems);

export default router;