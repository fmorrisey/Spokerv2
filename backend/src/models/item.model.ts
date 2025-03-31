import mongoose, { Schema, Document, Model } from "mongoose";


interface IItem extends Document {
    id: string;
    name: string;
    description: string;
    price: number;
}

interface ItemModel extends Model<IItem> {
    seed(): Promise<void>;
}

const itemSchema = new Schema({
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
    price: {
        type: Number,
        required: true,
    }
})

itemSchema.statics.seed = async function () {
    const sampleItems = [
        { id: 'item1', name: 'Alpha', description: 'Test A', price: 10 },
        { id: 'item2', name: 'Bravo', description: 'Test B', price: 20 },
        { id: 'item3', name: 'Charlie', description: 'Test C', price: 30 },
    ];

    await this.deleteMany({});
    await this.insertMany(sampleItems);
    console.log('✅ Item seed complete');
};

export const Item = mongoose.model<IItem, ItemModel>('Item', itemSchema);


