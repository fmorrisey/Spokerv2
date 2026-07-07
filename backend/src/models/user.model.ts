import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserType } from '../../src/types/user.type';

export interface IUser extends Document, Omit<UserType, '_id'> {
  password: string;
}

interface UserModel extends Model<IUser> {
  seed(): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['customer', 'owner'], default: 'customer' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Ensure passwords are also hashed when updated via query-based operations
userSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
  const update = this.getUpdate() as any;

  if (!update) {
    return next();
  }

  // Support both direct and $set-style updates
  const password =
    (update.$set && update.$set.password) !== undefined
      ? update.$set.password
      : update.password;

  if (!password) {
    return next();
  }

  const hashed = await bcrypt.hash(password, 12);

  if (update.$set && update.$set.password !== undefined) {
    update.$set.password = hashed;
  } else {
    update.password = hashed;
  }

  next();
});

// Seed a demo owner account so a fresh database has a user who can manage
// products. Credentials come from SEED_OWNER_* env vars (with dev defaults).
// Read lazily from process.env (not module-level constants) so the seed script
// picks up values loaded via dotenv after import time.
userSchema.statics.seed = async function () {
  const email = (process.env.SEED_OWNER_EMAIL || 'owner@spoker.dev').toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD || 'ownerpassword';
  const name = process.env.SEED_OWNER_NAME || 'Demo Owner';

  const existing = await this.findOne({ email });
  if (existing) {
    console.log(`⏭️  Skipping owner seed — ${email} already exists.`);
    return;
  }

  // Use create() (not insertMany) so the bcrypt pre-save hook hashes the password.
  await this.create({ email, password, name, role: 'owner' });
  console.log(`✅ Seeded owner account: ${email}`);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
