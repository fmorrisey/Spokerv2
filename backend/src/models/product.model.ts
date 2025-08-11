import mongoose, { Schema, Document, Model } from "mongoose";
import { ProductType as ProductSchema } from '../../src/types/product.type';

interface IProduct extends Document, Omit<ProductSchema, '_id'> {}
interface ProductModel extends Model<IProduct> {
    seed(): Promise<void>;
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    msrp: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    }
});

productSchema.statics.seed = async function () {
    const sampleProducts : ProductSchema[] = [
        { _id: '', name: 'Alpha', description: 'Test A', price: 10, msrp: 15 },
        { _id: '', name: 'Bravo', description: 'Test B', price: 20, msrp: 25 },
        { _id: '', name: 'Charlie', description: 'Test C', price: 30, msrp: 35 },
    ];

    await this.deleteMany({});
    await this.insertMany(sampleProducts);
    console.log('✅ Product seed complete');
};

export const Product = mongoose.model<IProduct, ProductModel>('Product', productSchema);