import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MongoDB_Uri environment is not defined");
        }
        await mongoose.connect(mongoUri,{
            tls: true,
            tlsAllowInvalidCertificates: true,
        })
        console.log("✅ MongoDB Connect Sucessfully");
    } catch (error) {
        console.error("💀 MongoDb connection error:", error);
        process.exit(1);
    }
};
