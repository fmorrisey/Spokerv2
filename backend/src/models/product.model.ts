import mongoose, { Schema, Document, Model } from "mongoose";

interface IProduct extends Document {
    id: string;
    name: string;
    description: string;
    price: number;
}

interface ProductModel extends Model<IProduct> {
    seed(): Promise<void>;
}

const productSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
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
})

productSchema.statics.seed = async function () {
    const sampleProducts = [
        { id: 'product1', name: 'Alpha', description: 'Test A', price: 10 },
        { id: 'product2', name: 'Bravo', description: 'Test B', price: 20 },
        { id: 'product3', name: 'Charlie', description: 'Test C', price: 30 },
    ];

    await this.deleteMany({});
    await this.insertMany(sampleProducts);
    console.log('✅ Product seed complete');
};

export const Product = mongoose.model<IProduct, ProductModel>('Product', productSchema);


