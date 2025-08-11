import { NextFunction, Request, RequestHandler, Response } from "express";
import * as ProductService from "../services/product.service";
import { ProductType } from "../types/product.type";

export const getAllProducts: RequestHandler<{}, ProductType[]> = async (
  _req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const products = await ProductService.findAll();
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
  try {
    const savedProduct = await ProductService.create(req.body);
    res.status(201).json(savedProduct);
  } catch (error) {
    if (next) {
      next(error);
    }
    res.status(500).json({ error: `Error creating product ${error}` });
  }
};
