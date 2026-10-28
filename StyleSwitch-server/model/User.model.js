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
    },
    number:{
        type:String,
        minlength:[10,"mobile number must be at least 10 numbers"],
        trim:true,
    },
    role:{
        type:String,
        enum:['admin','tenant','renter','lender'],
        required:true,
        default:'tenant'
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
    },
    resetPasswordExpire: {
        type: Date
    }
},{
    timestamps:true
});

// Enforce singleton administrator rule: ONLY ONE ADMIN IN THE ENTIRE PLATFORM
UserSchema.pre("save", async function (next) {
  if (this.isModified("role") && this.role === "admin") {
    const existingAdmin = await mongoose.model("User").findOne({
      role: "admin",
      _id: { $ne: this._id },
    });
    if (existingAdmin) {
      throw new Error("Strict singleton policy: only one single administrator is permitted across the entire platform.");
    }
  }
  next();
});

const User = mongoose.model('User' , UserSchema);
export default User;
