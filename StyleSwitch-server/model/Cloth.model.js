import mongoose from "mongoose";

const ClothSchema = new mongoose.Schema(
    {
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
        brand: {
            type: String,
            required: [true, "Brand is required"],
            trim: true,
            minlength: [2, "Brand must be at least 2 characters"],
            maxlength: [100, "Brand cannot exceed 100 characters"],
        },

        purchaseYear: {
            type: Date,
            required: [true, "Year of purchase is required"],
            
        },

        size: {
            type: String,
            required: [true, "Size is required"],
            enum: {
                values: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
                message: "Invalid clothing size",
            },
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "Sherwani",
                    "Gown",
                    "Bridal Lehenga",
                    "Suit",
                    "Tuxedo",
                    "Blazer",
                    "Indowestern Men",
                    "Indowestern Women",
                    "Designer Lehenga",
                ],
                message: "Invalid clothing category",
            },
        },

        gender: {
            type: String,
            required: true,
            enum: ["Men", "Women", "Unisex"],
        },

        color: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },

        condition: {
            type: String,
            required: true,
            enum: ["New", "Excellent", "Good", "Fair"],
            default: "Good",
        },

        conditionDescription: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        rentalPricePerDay: {
            type: Number,
            required: true,
            min: 0,
        },

        securityDeposit: {
            type: Number,
            default: 0,
            min: 0,
        },

        doesBill: {
            type: Boolean,
            required: [true, "Please specify whether you have the bill"],
        },

        billPhoto: {
            type: String,
            required: function () {
                return this.doesBill === true;
            },
            trim: true,
        },

        images: [
            {
                type: String,
                trim: true,
            },
        ],

        pickupAddress: {
            type: String,
            required: [true, "Pickup address is required"],
            trim: true,
            maxlength: [300, "Address cannot exceed 300 characters"],
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
            maxlength: [100, "City cannot exceed 100 characters"],
        },

        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
            match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"],
        },
    },
    {
        timestamps: true,
    }
);

const Cloth = mongoose.model("Cloth", ClothSchema);

export default Cloth;
