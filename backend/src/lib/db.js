import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Pinged Successfully: ${conn.connection.host}`)
    } catch (error) {
        console.log("DB Connection error:", error)
    }
}
