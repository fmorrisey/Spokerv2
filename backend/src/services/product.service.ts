import { Product } from "../models/product.model";
import { ProductType } from "../types/product.type";

export async function findAll(): Promise<ProductType[]> {
  const products = await Product.find().lean<ProductType[]>();
  return products;
}

export async function create(data: ProductType): Promise<ProductType> {
  const newProduct = new Product(data);
  const savedProduct = await newProduct.save();
  return savedProduct.toObject() as ProductType;
}

export async function findById(id: string): Promise<ProductType | null> {
  const product = await Product.findById(id).lean<ProductType>();
  return product;
}

export async function updateById(id: string, data: ProductType): Promise<ProductType | null> {
  const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true }).lean<ProductType>();
  return updatedProduct;
}

export async function deleteById(id: string): Promise<ProductType | null> {
  const deletedProduct = await Product.findByIdAndDelete(id).lean<ProductType>();
  return deletedProduct;
}