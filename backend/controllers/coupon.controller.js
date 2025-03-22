import Coupon from "../models/coupon.model.js";
export const getCoupon = async (req, res) => {
    try{
        const coupon = await Coupon.findOne({userId: req.user._id, isActive:true});
        res.json(coupon || null);
    }catch(error){
        console.log("error in getting coupon", error.message);
        res.status(500).json({ message: "server error", error: error.message})
    }
};

export const validateCoupon = async (req, res) => {
    try{
        const {code} = req.body;
        const Coupon = await Coupon.findOne({code: code, userId:user._id, isActive:true});
        if(!coupon){
            return res.status(404).json({message:"Coupon not found"});
        }
        if((coupon.expirationDate < Date.now())){
            coupon.isActive = false;
            await coupon.save();

            return res.status(400).json({message:"Coupon has expired"});
        }
        res.json({
            message:"Coupon is valid",
            code:coupon.code,
            discountPercentage:coupon.discountPercentage
        })

    }catch(error){
        console.log("error in validating coupon", error.message);
        res.status(500).json({ message: "server error", error: error.message})

    }
};
