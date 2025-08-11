import mongoose from "mongoose";

export const connectDB = async () => {
  // Skip actual MongoDB connection during Cypress tests
  if (process.env.MOCK_DB === 'true') {
    console.log('🧪 Using mocked database connection');
    return;
  }

  try {
    await mongoose.connect(process.env.DB_URI as string, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};