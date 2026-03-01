import mongoose from "mongoose";

const connectDB = async () => {
  // Check if MONGO_URI is defined in the environment variables
  try {
    await mongoose.connect(
      "mongodb+srv://amrareone:PTrRbgYEz9Y4hEor@listmangement.jlktzaf.mongodb.net/wingsexampreparation?retryWrites=true&w=majority&appName=listmangement",
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process with failure , to stop the server when facing issue in connect DB
  }
};

export default connectDB;
