import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function seedDemoUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const demoUser = {
      username: 'demouser',
      email: 'demo@withu247.com',
      password: 'Password123!',
    };

    const existingUser = await User.findOne({ email: demoUser.email });
    if (existingUser) {
      console.log('ℹ️ Demo user already exists');
    } else {
      const passwordHash = await bcrypt.hash(demoUser.password, 10);
      const user = new User({
        username: demoUser.username,
        email: demoUser.email,
        passwordHash,
      });
      await user.save();
      console.log('✅ Demo user created successfully');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding user:', err);
    process.exit(1);
  }
}

seedDemoUser();
