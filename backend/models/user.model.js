import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required:[true, " Name is Required"]
    },
    email: {
        type: String,
        required:[ "Email is Required"],
        unique:true,
        trim:true

    },
    password: {
        type: String,
        required:[true, "Password is Requires"],
        minlength:[6, "password must be at least 6 chareacters long"]
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Product"
            }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },

}, {timestamps: true}
);

 

 //presave-hook to hash password before saving database

userSchema.pre("save", async function (next) {
 if (!this.isModified("password")) return next();
    try{
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt .hash(this.password, salt);
next();

    }catch(error){
next(error);
    }
});

userSchema.methods.comparePassword = async function (password){
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.error(error);
        return false;
    }
};

const User = mongoose.model("User", userSchema);



 export default User;

