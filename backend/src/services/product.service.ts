import { Product } from "../models/product.model";
import { ProductType } from "../types/product.type";

export async function findAll(): Promise<ProductType[]> {
  const products = await Product.find().lean<ProductType[]>();
  return products;
}

export async function create(data: Omit<ProductType, '_id'>): Promise<ProductType> {
  const newProduct = new Product(data);
  const savedProduct = await newProduct.save();
  return savedProduct.toObject() as ProductType;
}
