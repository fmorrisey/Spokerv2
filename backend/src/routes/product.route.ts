import express from "express";
import { getAllProducts, createProduct } from "../controllers/product.controller";
import { ProductType } from '../../src/types/product.type';


// Define the router
const router = express.Router();

// Define the routes
router.get<{}, ProductType[]>('/', getAllProducts);
router.post<{}, ProductType>('/', createProduct);

export default router;
