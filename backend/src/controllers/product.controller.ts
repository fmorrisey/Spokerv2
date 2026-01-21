import { NextFunction, Request, RequestHandler, Response } from "express";
import * as ProductService from "../services/product.service";
import { ProductType } from "../types/product.type";

function notFoundError(message: string) {
  return Object.assign(new Error(message), { statusCode: 404 });
}

export const getAllProducts: RequestHandler<{}, ProductType[]> = async (
  _req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const products = await ProductService.findAll();
    res.status(200).json(products);
  } catch (error) {
    next?.(new Error(`Error fetching products ${error}` ));
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
    next?.(new Error(`Error creating product ${error}` ));
  }
};

export const getProductById: RequestHandler<{ id: string }, ProductType | null> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const product = await ProductService.findById(req.params.id);
    if (!product) {
      next?.(notFoundError("Product not found"));
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    next?.(new Error(`Error fetching product ${error}` ));
  }
};

export const updateProductById: RequestHandler<{ id: string }, ProductType | null> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const updatedProduct = await ProductService.updateById(req.params.id, req.body);
    if (!updatedProduct) {
      next?.(notFoundError("Product not found"));
      return;
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    next?.(new Error(`Error updating product ${error}` ));
  }
};

export const deleteProductById: RequestHandler<{ id: string }, void> = async (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  try {
    const deletedProduct = await ProductService.deleteById(req.params.id);
    if (!deletedProduct) {
      next?.(notFoundError("Product not found"));
      return;
    }
    res.status(204).send();
  } catch (error) {
    next?.(new Error(`Error deleting product ${error}` ));
  }
};
