import express from "express";
import { getAllProducts, createProduct, getProductById, updateProductById, deleteProductById } from "../controllers/product.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { ProductType } from '../../src/types/product.type';


// Define the router
const router = express.Router();

// Define the routes — reads are public; mutations require an authenticated owner
router.get<{}, ProductType[]>('/', getAllProducts);
router.get<{ id: string }, ProductType | null>('/:id', getProductById);
router.post<{}, ProductType>('/', authenticate, authorize('owner'), createProduct);
router.put<{ id: string }, ProductType | null>('/:id', authenticate, authorize('owner'), updateProductById);
router.delete<{ id: string }, void>('/:id', authenticate, authorize('owner'), deleteProductById);

export default router;
