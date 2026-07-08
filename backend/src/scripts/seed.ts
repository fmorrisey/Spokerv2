import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

// Parse args
const args = process.argv.slice(2);
const envArg = args.find(a => a.startsWith('--env='));
const envFile = envArg ? envArg.split('=')[1] : '.env';
const envPath = path.resolve(__dirname, '../../', envFile);
const force = args.includes('--force');

dotenv.config({ path: envPath });

if (!process.env.DB_URI) {
    console.error(`❌ DB_URI not found. Checked: ${envPath}`);
    console.error('   Try: npm run seed -- --env=.env.prod');
    process.exit(1);
}

async function main() {
    console.log(`🔌 Connecting to database...`);
    await mongoose.connect(process.env.DB_URI as string);
    console.log('✅ Connected');

    if (force) {
        const deleted = await Product.deleteMany({});
        console.log(`🗑️  Cleared ${deleted.deletedCount} existing products`);
    }

    await Product.seed();
    await User.seed();

    await mongoose.connection.close();
    console.log('🔌 Disconnected');
}

main().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
