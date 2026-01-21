/** @type {import('ts-jest').JestConfigWithTsJest} */

import * as productController from '../../src/controllers/product.controller';
import * as ProductService from '../../src/services/product.service';
import app from '../../src/app';
import request from 'supertest';
import { jest } from "@jest/globals";
import { ProductType } from '../../src/types/product.type';
import { API_URL, Routes } from '../../src/models/constants';

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all products', async () => {
    const mockProducts: ProductType[] = [
      { _id: '1', name: 'Product 1', description: 'Description 1', msrp: 110, price: 100 },
      { _id: '2', name: 'Product 2', description: 'Description 2', msrp: 210, price: 200 },
    ];

    jest.spyOn(ProductService, 'findAll').mockResolvedValue(mockProducts as any);

    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await productController.getAllProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  it('should handle errors in getAllProducts', async () => {
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    jest.spyOn(ProductService, 'findAll').mockRejectedValue(new Error('Database error'));

    await productController.getAllProducts(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should create a new product', async () => {
    const newProductData: Omit<ProductType, '_id'> = {
      name: 'New Product',
      description: 'New Description',
      msrp: 330,
      price: 300,
    };
    const savedProduct: ProductType = { _id: '3', ...newProductData };

    jest.spyOn(ProductService, 'create').mockResolvedValue(savedProduct as any);

    const req: any = { body: newProductData };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await productController.createProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(savedProduct);
  });

  it('should handle errors in createProduct', async () => {
    const req: any = { body: {} };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    jest.spyOn(ProductService, 'create').mockRejectedValue(new Error('Database error'));

    await productController.createProduct(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Test get product by id
  it('should fetch a product by id', async () => {
    const mockProduct: ProductType = { _id: '1', name: 'Product 1', description: 'Description 1', msrp: 110, price: 100 };

    jest.spyOn(ProductService, 'findById').mockResolvedValue(mockProduct as any);

    const req: any = { params: { id: '1' } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await productController.getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });

  // test update product by id
  it('should update a product by id', async () => {
    const mockProduct: ProductType = { _id: '1', name: 'Product 1', description: 'Description 1', msrp: 110, price: 100 };
    const updatedProductData: ProductType = { _id: '1', name: 'Updated Product 1', description: 'Updated Description 1', msrp: 120, price: 110 };

    jest.spyOn(ProductService, 'findById').mockResolvedValue(mockProduct as any);
    jest.spyOn(ProductService, 'updateById').mockResolvedValue(updatedProductData as any);

    const req: any = { params: { id: '1' }, body: updatedProductData };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await productController.updateProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedProductData);
  });

  // test delete product by id
  it('should delete a product by id', async () => {
    const mockProduct: ProductType = { _id: '1', name: 'Product 1', description: 'Description 1', msrp: 110, price: 100 };

    jest.spyOn(ProductService, 'findById').mockResolvedValue(mockProduct as any);
    jest.spyOn(ProductService, 'deleteById').mockResolvedValue(mockProduct as any);

    const req: any = { params: { id: '1' } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await productController.deleteProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

describe('Product API', () => {
  it('GET /api/products and expect 200', async () => {
    jest.spyOn(ProductService, 'findAll').mockResolvedValue([] as any);
    const res = await request(app).get(API_URL + Routes.PRODUCTS);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/productsbadroute and return 404', async () => {
    jest.spyOn(ProductService, 'findAll').mockResolvedValue([] as any);
    const res = await request(app).get(API_URL + Routes.PRODUCTS + 'badroute');
    expect(res.status).toBe(404);
  });
})
