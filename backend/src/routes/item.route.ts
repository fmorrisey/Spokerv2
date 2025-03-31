import express from "express";
import { getAllItems } from "../controllers/item.controller";

const router = express.Router();

router.get("/", getAllItems);

export default router;