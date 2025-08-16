import { Product } from '../models/product.model';
import { ProductType } from '../types/product.type';

let products: ProductType[] = [];

const originalFind = Product.find;
const originalSave = Product.prototype.save;

export const startMockDB = async () => {
  products = [
    { _id: '6898e763ea16ab3643d4be91', name: 'Product 1', description: 'Product 1 description', price: 10, msrp: 15 },
    { _id: '6898e762ea16ab3643d4be92', name: 'Product 2', description: 'Product 2 description', price: 20, msrp: 25 },
    { _id: '6898e761ea16ab3643d4be93', name: 'Product 3', description: 'Product 3 description', price: 30, msrp: 35 },
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
