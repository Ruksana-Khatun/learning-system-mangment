import 'dotenv/config';
import app from "./app.js";
import connectionToDB from "./config/dbConection.js";
import cloudinary from './config/cloudinary.config.js';
import { createDefaultAdmin } from "./utils/createDefaultAdmin.js";

const PORT = process.env.PORT || 5000;

// Initialize Cloudinary config if credentials are available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
} else {
    console.warn('Cloudinary keys are missing. Image uploads will be unavailable.');
}
export let razorpay = null;

const initializeRazorpay = async () => {
    if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
        console.warn('Razorpay keys are missing. Payment APIs will be unavailable.');
        return;
    }

    try {
        const { default: Razorpay } = await import('razorpay');
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_API_SECRET,
        });
    } catch (error) {
        console.warn('Razorpay package is not installed. Payment APIs will be unavailable.');
    }
};

const startServer = async () => {
    try {
        
        await connectionToDB();
        await createDefaultAdmin();
        await initializeRazorpay();
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};
startServer();
