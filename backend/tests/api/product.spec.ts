/** @type {import('ts-jest').JestConfigWithTsJest} */

import * as productController from '../../src/controllers/product.controller';
import * as ProductService from '../../src/services/product.service';
import { jest } from "@jest/globals";
import { ProductType } from '../../src/types/product.type';

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

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Error fetching products') });
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

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Error creating product') });
  });
});
