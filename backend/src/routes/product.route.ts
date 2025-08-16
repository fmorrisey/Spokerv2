import express from "express";
import { getAllProducts, createProduct, getProductById, updateProductById, deleteProductById } from "../controllers/product.controller";
import { ProductType } from '../../src/types/product.type';


// Define the router
const router = express.Router();

// Define the routes
router.get<{}, ProductType[]>('/', getAllProducts);
router.post<{}, ProductType>('/', createProduct);
router.get<{ id: string }, ProductType | null>('/:id', getProductById);
router.put<{ id: string }, ProductType | null>('/:id', updateProductById);
router.delete<{ id: string }, ProductType | null>('/:id', deleteProductById);

export default router;
