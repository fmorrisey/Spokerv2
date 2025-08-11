import { NextFunction, RequestHandler, Request, Response } from "express";
import { Product } from "../models/product.model";
import { ProductType } from '../../src/types/product.type';

// In-memory mock data used when running with a mocked database
const mockProducts: ProductType[] = [
  { _id: '1', name: 'Alpha', description: 'Test A', msrp: 15, price: 10 },
  { _id: '2', name: 'Bravo', description: 'Test B', msrp: 25, price: 20 },
  { _id: '3', name: 'Charlie', description: 'Test C', msrp: 35, price: 30 },
];


export const getAllProducts: RequestHandler<{}, ProductType[]> = async (
  _req: Request,
  res: Response,
  next?: NextFunction,
) => {
  // When MOCK_DB is enabled (Cypress), return mock data instead of querying MongoDB
  if (process.env.MOCK_DB === 'true') {
    res.status(200).json(mockProducts);
    return;
  }

  try {
    const products = await Product.find().lean<ProductType[]>();
    res.status(200).json(products);
  } catch (error) {
    if (next) {
      next(error);
    }
    res.status(500).json({ error: `Error fetching products ${error}` });
  }
};

export const createProduct: RequestHandler<{}, ProductType> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  // When MOCK_DB is enabled (Cypress), push to the mock array instead of using MongoDB
  if (process.env.MOCK_DB === 'true') {
    const newProduct: ProductType = {
      _id: String(mockProducts.length + 1),
      ...req.body,
    };
    mockProducts.push(newProduct);
    res.status(201).json(newProduct);
    return;
  }

  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct.toObject());
  } catch (error) {
    if (next) {
      next(error);
    }
    res.status(500).json({ error: `Error creating product ${error}` });
  }
};