
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";


export const createCheckoutSession = async (req, res) => {
    
        try{
            const {products,couponCode} = rq.body;
        
            if(!Array.isArray(products) || products.length === 0){
                return res.status(404).json({error: "Invalid or empty products array"});
            }
        
            let totalAmount = 0;
            const lineItems = products.map(product =>{
                const amount = Math.round(product.price * 100); //convert to cents format  by stripe
                totalAmount += amount * product.quantity;
        
                return {
                    price_data : {
                        currency:"usd",
                        product_data:{
                            name: product.title,
                            images: [product.image],
                        },
                        unit_amount: amount
        
                },
            };
        });
        
        let coupon =null;
        if (couponCode){
            coupon = await coupon.findOne({code:couponCode, userId:user._id, isActive:true});
            if(coupon) {
                totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100));
            }
        }
        
        const session = await stripe .checkout.sessions.create({
            payment_method_types: ["card"],
            line_items:lineItems,
            mode:"payment",
            success_url:`${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancelled`,
            discounts: coupon
             ? 
             [{
                coupon: await createStripeCoupon(coupon.discountPercentage),
            }] : [],
            metadata:{
                userId:req.user._id.toString(),
                couponCode: couponCode || null,
                products: JSON.stringify(
                    products.map((p)=>({
                        id:p._id,
                        quantity: p.quantity,
                        price: p.price
                    })
                )),
            },
        });
        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        
        }
           res.status(200).json({id:session.id, totalAmount: totalAmount/100});
        
        }catch(error){
            console.log("error in creating checkout session", error.message);
            res.status(500).json({message:"server error", error: error.message});
        
        }
        
        };



export const checkoutSuccess = async (req, res)=> {
    try{
    const SessonId = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if(session.payment_status === "paid"){
        if(session.metadata.couponCode) {
            await Coupon.findOneAndUpdate({code:session.metadata.couponCode, userId:req.user._id},
    
                {
                    isActive: false
    
                });
        }  
        //create a new order
        const products = JSON.parse(session.metadata.products) 
        const newOrder =  new Order({
            user: session.metadata.sessionId,
            products:products.map(product=>({
            product: product.id,
            quantity: product.quantity,
            price: product.price,
        })),
    tatolAmount : session.amount/100,//convert cents to dollers
    stripeSessionId: sessionId,
    })
    await newOrder.save();
    res.status(200).json({
        success: true,
        message: "Payment Scessfull, order created and coupon deactivated if used",
        order_id: newOrder._id,
    });
    
    }
    
    }
    catch (error){
        console.log("error in checkout success", error.message);
        res.status(500).json({message: error.message});
    
    }
    };
        
        async function createStripeCoupon(discountPercentage) {
            const coupon = await stripe.coupons.create({
              percent_off: discountPercentage,
              duration: "once",
            });
          
            return stripeCoupon.id;
          };
        
          async function createNewCoupon(userId){
            const newCoupon = await new Coupon({
                code:"GIFT" + Math.random().toString(36).substring(2, 9).toUpperCase(),
                discountpercentage:10,
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                userId: userId,
        
            });
            await newCoupon.save();
        
            return newCoupon
        
          };

        