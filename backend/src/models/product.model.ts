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
    const sampleProducts: Omit<ProductSchema, '_id'>[] = [
        // Electronics
        { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and hi-res audio support. Foldable design with carrying case included.', msrp: 349.99, price: 279.99 },
        { name: '4K Ultra HD Monitor 27"', description: 'IPS panel with 99% sRGB color accuracy, USB-C power delivery, and adjustable stand. Perfect for creative professionals and developers.', msrp: 499.99, price: 449.99 },
        { name: 'Mechanical Keyboard RGB', description: 'Hot-swappable switches, per-key RGB lighting, aluminum frame, and programmable macros. Includes wrist rest and keycap puller.', msrp: 159.99, price: 129.99 },
        { name: 'Portable Bluetooth Speaker', description: 'Waterproof IPX7 speaker with 360-degree sound, 20-hour playtime, and built-in microphone for calls. Pairs with up to 3 devices.', msrp: 129.99, price: 89.99 },
        { name: 'USB-C Docking Station', description: 'Triple display support, 100W power delivery, 10Gbps data transfer. Includes HDMI, DisplayPort, Ethernet, and SD card reader.', msrp: 199.99, price: 179.99 },

        // Clothing
        { name: 'Merino Wool Quarter-Zip', description: 'Lightweight merino wool pullover with moisture-wicking properties. Machine washable, odor-resistant, and perfect for layering in any season.', msrp: 128.00, price: 98.00 },
        { name: 'Stretch Chino Pants', description: 'Tailored fit chinos with 2% elastane for all-day comfort. Wrinkle-resistant fabric with reinforced seams. Available in 6 colors.', msrp: 89.00, price: 89.00 },
        { name: 'Trail Running Shoes', description: 'Aggressive tread pattern with Vibram outsole, waterproof membrane, and responsive cushioning. Built for technical terrain.', msrp: 165.00, price: 132.00 },
        { name: 'Insulated Rain Jacket', description: 'Three-layer waterproof shell with sealed seams, adjustable hood, and pit zips. Packs into its own pocket for travel.', msrp: 225.00, price: 189.00 },

        // Home Goods
        { name: 'Cast Iron Dutch Oven 6Qt', description: 'Enameled cast iron with self-basting lid. Even heat distribution for braising, baking, and slow cooking. Oven safe to 500°F.', msrp: 89.99, price: 69.99 },
        { name: 'Pour-Over Coffee Maker Set', description: 'Borosilicate glass carafe with stainless steel reusable filter. Includes gooseneck kettle, scale, and brewing guide.', msrp: 74.99, price: 59.99 },
        { name: 'Smart LED Desk Lamp', description: 'Adjustable color temperature from 2700K to 6500K with memory function. USB charging port, auto-dimming sensor, and 50,000-hour lifespan.', msrp: 79.99, price: 64.99 },
        { name: 'Bamboo Cutting Board Set', description: 'Set of 3 organic bamboo boards with juice grooves and non-slip edges. Naturally antimicrobial and knife-friendly surface.', msrp: 49.99, price: 39.99 },

        // Tech Accessories
        { name: 'Laptop Backpack 15.6"', description: 'Water-resistant fabric with padded laptop compartment, hidden anti-theft pocket, and USB charging port. TSA-friendly design.', msrp: 79.99, price: 59.99 },
        { name: 'Wireless Charging Pad Duo', description: 'Charges two devices simultaneously at 15W each. Compatible with all Qi-enabled devices. Includes USB-C cable and wall adapter.', msrp: 49.99, price: 34.99 },
        { name: '1TB Portable SSD', description: 'Read speeds up to 1050 MB/s in a shock-resistant aluminum enclosure. USB-C with backward-compatible USB-A cable included.', msrp: 109.99, price: 89.99 },
        { name: 'Webcam 4K AutoFocus', description: 'Sony STARVIS sensor with HDR, dual noise-cancelling microphones, and automatic low-light correction. Privacy shutter included.', msrp: 149.99, price: 119.99 },

        // Fitness
        { name: 'Adjustable Dumbbell Set 5-50lb', description: 'Quick-change weight selector replaces 15 pairs of dumbbells. Durable steel construction with textured grip. Includes storage tray.', msrp: 399.99, price: 349.99 },
        { name: 'Yoga Mat Premium 6mm', description: 'Non-slip natural rubber with alignment markings. Closed-cell surface resists moisture and bacteria. Includes carrying strap.', msrp: 69.99, price: 54.99 },

        // Pets
        { name: 'Butch the Cat', description: 'Distinguished tuxedo gentleman with an industrial-grade purr motor and impeccable manners. The sweetest boy you will ever meet. Not actually for sale — he is priceless.', msrp: 999999.99, price: 999999.99 },
    ];

    const existing = await this.countDocuments();
    if (existing > 0) {
        console.log(`⏭️  Skipping seed — ${existing} products already exist. Use --force to replace.`);
        return;
    }

    await this.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} products`);
};

export const Product = mongoose.model<IProduct, ProductModel>('Product', productSchema);