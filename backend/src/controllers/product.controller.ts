import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.model";

export const getAllProducts = async (req: Request, res: Response, next?: NextFunction) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    if (next) { next(error); }
    res.status(500).json({ error: `Error fetching products ${error}` });
  }
}

export const createProduct = async (req: Request, res: Response, next?: NextFunction) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) { 
    if (next) { next(error); }
    res.status(500).json({ error: `Error creating product ${error}` });
  }
}