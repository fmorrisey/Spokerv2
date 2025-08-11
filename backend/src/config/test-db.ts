import { Product } from '../models/product.model';
import { ProductType } from '../types/product.type';

let products: ProductType[] = [];

const originalFind = Product.find;
const originalSave = Product.prototype.save;

export const startMockDB = async () => {
  products = [
    { _id: '1', name: 'Alpha', description: 'Test A', price: 10, msrp: 15 },
    { _id: '2', name: 'Bravo', description: 'Test B', price: 20, msrp: 25 },
    { _id: '3', name: 'Charlie', description: 'Test C', price: 30, msrp: 35 },
  ];

  (Product.find as any) = () => ({
    lean: async () => products,
  });

  (Product.prototype.save as any) = function (this: any) {
    const newProduct: ProductType = {
      _id: (products.length + 1).toString(),
      ...this.toObject(),
    };
    products.push(newProduct);
    return { toObject: () => newProduct } as any;
  };
};

export const stopMockDB = async () => {
  Product.find = originalFind;
  Product.prototype.save = originalSave;
  products = [];
};

export default { startMockDB, stopMockDB };
