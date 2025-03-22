import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/product.route.js";  
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js";


dotenv.config();

const app = express();
app.use(cookieParser()); // allow to parse cookies 
app.use(express.json({limit:"10mb"})); // allow to parse the body of the request





app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen( PORT , ()=>{
console.log("Server running on http://localhost:"+ PORT);
connectDB();

});