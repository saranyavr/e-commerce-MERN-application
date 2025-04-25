import User from "./../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { redis } from "./../lib/redis.js";


dotenv.config();

const generateTokens =(userId) =>{
  
    const accessToken =jwt.sign( { userId }, process.env.ACCESSTOKEN_JWT_SECRET,{
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId}, process.env.REFRESHTOKEN_JWT_SECRET,{
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  };

const storeRefreshToken = async (userId, refreshToken) => {
    
    await redis.set(`refreshToken:${userId}`, refreshToken,"EX", 7 * 24 * 60 * 60);//7days
};
const setCookies= (res, accessToken, refreshToken) =>{
    res.cookie("accesstoken", accessToken,{
    httpOnly: true, //prevent xss attacks, cross site scripting attacks
    secure:process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent csrf attacks, cross site request forgery attacks
    maxAge: 15 * 60 * 1000, //15 minutes
    });
    res.cookie("refreshtoken", refreshToken,{
        httpOnly: true, //prevent xss attacks, cross site scripting attacks
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict", // prevent csrf attacks, cross site request forgery attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
        });
};


export const signup = async( req, res ) => {
const { email, password, name } = req.body;
try{
const userExsist = await User.findOne({ email });
if(userExsist){
    res.status(400);
    throw new Error("User already exists");
}
const user = await User.create({ name, email, password });
//auntheticate
const { accessToken, refreshToken } = generateTokens(user._id);
await storeRefreshToken(user._id, refreshToken);

setCookies(res, accessToken, refreshToken);

res.status(201).json({user:
    {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
}, 
message: "User created successfully"});

}catch(error){
    console.log("Error signing up:", error.message);
    res.status(500).json({message:error.message});
}
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
   
    if (user) {
     
      const isValidPassword = await user.comparePassword(String(password));
      
      if (isValidPassword) {
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);
        res.status(200).json({ user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }, message: "User logged in succesfully" });
      } else {
        
        res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
   
    res.status(500).json({ message: error.message });
  }
};
export const logout = async (req, res) => {
    
  try {
    const refreshToken = req.cookies.refreshtoken;


    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_JWT_SECRET);
      const userId = decoded.userId;
      await redis.del(`refreshToken:${userId}`);
     
    } 
    res.clearCookie("accesstoken");
    res.clearCookie("refreshtoken");
    res.status(200).json({ message: "User logged out successfully" });
   
  } catch (error) {
    console.log("Error logging out:", error.message);
    res.status(500).json({ message: error.message });
  }
};
//this will allow the user to get a new access token if the old one expires
export const refreshToken = async (req, res) => {
    try{
        const refreshToken  = req.cookies.refreshtoken;
        if(!refreshToken){
            res.status(401);
            throw new Error("No refersh token provided");

        }
        const decoded = jwt.verify( refreshToken, process.env.REFRESHTOKEN_JWT_SECRET);
        const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

        if (storedToken !== refreshToken) {
            res.status(401);
            throw new Error("Invalid refresh token");
        }
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESSTOKEN_JWT_SECRET, {
            expiresIn: "15m",
          });
          res.cookie("accesstoken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,

          });
          res.status(200).json({message: "Access token refreshed successfully"});

    }catch(error) { 
        console.log("Error refreshing :", error.message);
        res.status(500).json({message: error.message});

    }

};

export const getProfile = async (req, res) => {
  try {
   res.json(req.user);

    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

