import express from "express";
import { getAllProducts, createProduct, getProductById, updateProductById, deleteProductById } from "../controllers/product.controller";
import { authenticate } from "../middleware/authenticate";
import { ProductType } from '../../src/types/product.type';


// Define the router
const router = express.Router();

// Define the routes
router.get<{}, ProductType[]>('/', getAllProducts);
router.get<{ id: string }, ProductType | null>('/:id', getProductById);
router.post<{}, ProductType>('/', authenticate, createProduct);
router.put<{ id: string }, ProductType | null>('/:id', authenticate, updateProductById);
router.delete<{ id: string }, void>('/:id', authenticate, deleteProductById);

export default router;
