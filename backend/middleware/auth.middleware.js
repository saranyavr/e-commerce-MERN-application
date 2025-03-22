import jwt from "jsonwebtoken";
import User from "../models/user.model.js";




export const protectRoute = async (req, res, next) => {
  
  try {
    const accessToken = req.cookies.accesstoken; //get all access token from cookies
    if (!accessToken) {
     
      res.status(401).json({ message: "Not authorized, no token provided" });
      return;
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESSTOKEN_JWT_SECRET);
      const user = await User.findOne({_id: decoded.userId}).select("-password"); //get user from database and remove password

      if (!user) {
       
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      req.user = user;
      console.log("req.user:", req.user.role);

      next(); // Call next() to pass the request to the next middleware

    } catch (error) {
      
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired, please log in again" });
      }
    }
  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }
};

export const adminRoute = (req, res, next) => {
    
    try {
      if (req.user && req.user.role === "admin") {
        console.log("Admin user found");
             next();
    
      }else {
        
        return res.status(403).json({ message: "Access denied- Admin only" });
      }
    } catch (error) {
       
      return res.status(500).json({ message: error.message });
    }
  };