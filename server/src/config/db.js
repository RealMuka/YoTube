import mongoose from 'mongoose';
export async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI не задана. Создайте .env на основе .env.example.');
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
    console.info('MongoDB connected');
}
