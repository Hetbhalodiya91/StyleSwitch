import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{
        type : String,
        required:true,
        trim : true
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase: true, 
        trim: true
    },
    password:{
        type:String ,
        required:true,
        minlength:[8,"Password must be at least 8 characters long"],
        validate:{
            validator:function(value){
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
            },message:"Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
        },
        
    },
    number:{
        type:String,
        minlength:[10,"mobile number must be at least 10 numbers"],
        trim:true,
    },
    role:{
        type:String,
        enum:['admin','tenant','lender'],
        default:'buyer'
    },
    isBlock :{
        type:Boolean,
        default:false
    },
    address:{
        type:String
    },
    resetPasswordToken:{
        type:String
    },resetPasswordExpire: {
        type: Date
    }
},{
    timestamps:true
});

const User = mongoose.model('User' , UserSchema);
export default User;