import mongoose, { Schema, Document, Model } from "mongoose";

interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    msrp: number;
}

interface ProductModel extends Model<IProduct> {
    seed(): Promise<void>;
}

const productSchema = new Schema({
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
    const sampleProducts = [
        { name: 'Alpha', description: 'Test A', price: 10, msrp: 15 },
        { name: 'Bravo', description: 'Test B', price: 20, msrp: 25 },
        { name: 'Charlie', description: 'Test C', price: 30, msrp: 35 },
    ];

    await this.deleteMany({});
    await this.insertMany(sampleProducts);
    console.log('✅ Product seed complete');
};

export const Product = mongoose.model<IProduct, ProductModel>('Product', productSchema);