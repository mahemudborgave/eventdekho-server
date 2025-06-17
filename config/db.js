import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB.");
    }
    catch(error) {
        console.log(`Mongo Connection Error : ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;