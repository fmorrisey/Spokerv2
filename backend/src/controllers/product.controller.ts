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

export const getProductById: RequestHandler<{ id: string }, ProductType | null> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const product = await ProductService.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    if (next) {
      next(error);
    }
    res.status(500).json({ error: `Error fetching product ${error}` });
  }
};

export const updateProductById: RequestHandler<{ id: string }, ProductType | null> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const updatedProduct = await ProductService.updateById(req.params.id, req.body);
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (next) {
      next(error);
    }
    res.status(500).json({ error: `Error updating product ${error}` });
  }
};

export const deleteProductById: RequestHandler<{ id: string }, ProductType | null> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const deletedProduct = await ProductService.deleteById(req.params.id);
    res.status(200).json(deletedProduct);
  } catch (error) {
    if (next) {
      next(error);
    }
    res.status(500).json({ error: `Error deleting product ${error}` });
  }
};
