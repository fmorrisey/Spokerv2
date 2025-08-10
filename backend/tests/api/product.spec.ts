/** @type {import('ts-jest').JestConfigWithTsJest} */

const productController = require('../../src/controllers/product.controller');
import { getAllProducts } from '../../src/controllers/product.controller';
import { jest } from "@jest/globals";
import { Product } from '../../src/models/product.model';

// Write a test for the getAllProducts function
describe('Product Controller', () => {
it('should fetch all products', async () => {
    const mockProducts : any = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
    ];

    jest.spyOn(Product, 'find').mockResolvedValue(mockProducts);

    const req: any = {};
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    const next = jest.fn();

    await getAllProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducts);

  });

  // Write a test for a 500 error in getAllProducts
  it('should handle errors in getAllProducts', async () => {
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Simulate an error by throwing an exception
    jest.spyOn(Product, 'find').mockImplementation(() => {
      throw new Error('Database error');
    });

    await getAllProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Error fetching products') });
  });

  // Write a test for the createProduct function
  it('should create a new product', async () => {
    const newProductData = { name: 'New Product', price: 300 };
    const savedProduct = { id: 3, ...newProductData };

    jest.spyOn(Product.prototype, 'save').mockResolvedValue(savedProduct);

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

  // Write a test for a 500 error in createProduct
  it('should handle errors in createProduct', async () => {
    const req: any = { body: {} };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Simulate an error by throwing an exception
    jest.spyOn(Product.prototype, 'save').mockImplementation(() => {
      throw new Error('Database error');
    });

    await productController.createProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Error creating product') });
  });
});