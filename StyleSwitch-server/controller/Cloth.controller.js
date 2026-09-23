import mongoose from "mongoose";
import Cloth from "../model/Cloth.model.js";

/**
 * Add new clothing
 */
export const addCloth = async (req, res) => {
    try {
        const {
            brand,
            category,
            gender,
            size,
            color,
            description,
            purchaseDate,
            condition,
            conditionDescription,
            images,
            rentalPricePerDay,
            securityDeposit,
            doesBill,
            billPhoto,
            pickupAddress,
            city,
            pincode,
        } = req.body;

        // Required fields
        if (
            !brand ||
            !category ||
            !gender ||
            !size ||
            !color ||
            !condition ||
            rentalPricePerDay === undefined ||
            doesBill === undefined ||
            !pickupAddress ||
            !city ||
            !pincode
        ) {
            return res.status(400).json({
                message: "Please provide all required fields",
            });
        }

        // Validate lender
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Validate rental price
        if (Number(rentalPricePerDay) < 0) {
            return res.status(400).json({
                message: "Rental price cannot be negative",
            });
        }

        // Validate security deposit
        if (
            securityDeposit !== undefined &&
            Number(securityDeposit) < 0
        ) {
            return res.status(400).json({
                message: "Security deposit cannot be negative",
            });
        }

        // Validate bill photo
        if (doesBill === true && !billPhoto) {
            return res.status(400).json({
                message: "Bill photo is required when bill is available",
            });
        }

        // Validate images
        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                message: "At least one clothing image is required",
            });
        }

        // Create clothing
        const cloth = await Cloth.create({
            lenderId: req.user.id,
            brand: brand.trim(),
            category,
            gender,
            size,
            color: color.trim(),
            description: description?.trim(),
            purchaseDate,
            condition,
            conditionDescription: conditionDescription?.trim(),
            images,
            rentalPricePerDay: Number(rentalPricePerDay),
            securityDeposit: Number(securityDeposit || 0),
            doesBill,
            billPhoto,
            pickupAddress: pickupAddress.trim(),
            city: city.trim(),
            pincode: String(pincode).trim(),
            isAvailable: true,
        });

        return res.status(201).json({
            message: "Clothing added successfully",
            cloth,
        });
    } catch (err) {
        console.error("Add cloth error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


/**
 * Get all clothing
 */
export const getAllClothes = async (req, res) => {
    try {
        const clothes = await Cloth.find()
            .populate("lenderId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Clothing fetched successfully",
            count: clothes.length,
            clothes,
        });
    } catch (err) {
        console.error("Get clothes error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


/**
 * Get single clothing
 */
export const getClothById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid clothing ID",
            });
        }

        const cloth = await Cloth.findById(id)
            .populate("lenderId", "name email");

        if (!cloth) {
            return res.status(404).json({
                message: "Clothing not found",
            });
        }

        return res.status(200).json({
            message: "Clothing fetched successfully",
            cloth,
        });
    } catch (err) {
        console.error("Get cloth error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


/**
 * Update clothing
 */
export const updateCloth = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid clothing ID",
            });
        }

        const cloth = await Cloth.findById(id);

        if (!cloth) {
            return res.status(404).json({
                message: "Clothing not found",
            });
        }

        // Only owner can update
        if (cloth.lenderId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "You are not allowed to update this clothing",
            });
        }

        const allowedFields = [
            "brand",
            "category",
            "gender",
            "size",
            "color",
            "description",
            "purchaseDate",
            "condition",
            "conditionDescription",
            "images",
            "rentalPricePerDay",
            "securityDeposit",
            "doesBill",
            "billPhoto",
            "pickupAddress",
            "city",
            "pincode",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                cloth[field] = req.body[field];
            }
        });

        // Validate rental price
        if (cloth.rentalPricePerDay < 0) {
            return res.status(400).json({
                message: "Rental price cannot be negative",
            });
        }

        // Validate security deposit
        if (cloth.securityDeposit < 0) {
            return res.status(400).json({
                message: "Security deposit cannot be negative",
            });
        }

        // Validate bill
        if (cloth.doesBill === true && !cloth.billPhoto) {
            return res.status(400).json({
                message: "Bill photo is required when bill is available",
            });
        }

        await cloth.save();

        return res.status(200).json({
            message: "Clothing updated successfully",
            cloth,
        });
    } catch (err) {
        console.error("Update cloth error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


/**
 * Delete clothing
 */
export const deleteCloth = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid clothing ID",
            });
        }

        const cloth = await Cloth.findById(id);

        if (!cloth) {
            return res.status(404).json({
                message: "Clothing not found",
            });
        }

        // Only owner can delete
        if (cloth.lenderId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "You are not allowed to delete this clothing",
            });
        }

        await Cloth.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Clothing deleted successfully",
        });
    } catch (err) {
        console.error("Delete cloth error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


/**
 * Get clothing owned by logged-in lender
 */
export const getMyClothes = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const clothes = await Cloth.find({
            lenderId: req.user.id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your clothing fetched successfully",
            count: clothes.length,
            clothes,
        });
    } catch (err) {
        console.error("Get my clothes error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


/**
 * Change clothing availability
 */
// export const updateClothAvailability = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { isAvailable } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 message: "Invalid clothing ID",
//             });
//         }

//         if (typeof isAvailable !== "boolean") {
//             return res.status(400).json({
//                 message: "isAvailable must be true or false",
//             });
//         }

//         const cloth = await Cloth.findById(id);

//         if (!cloth) {
//             return res.status(404).json({
//                 message: "Clothing not found",
//             });
//         }

//         if (cloth.lenderId.toString() !== req.user.id.toString()) {
//             return res.status(403).json({
//                 message: "You are not allowed to update this clothing",
//             });
//         }

//         cloth.isAvailable = isAvailable;

//         await cloth.save();

//         return res.status(200).json({
//             message: isAvailable
//                 ? "Clothing is now available"
//                 : "Clothing is now unavailable",
//             cloth,
//         });
//     } catch (err) {
//         console.error("Update availability error:", err);

//         return res.status(500).json({
//             message: err.message,
//         });
//     }
// };


/**
 * Search and filter clothing
 */
export const searchClothes = async (req, res) => {
    try {
        const {
            category,
            gender,
            size,
            city,
            color,
            condition,
            minPrice,
            maxPrice,
        } = req.query;

        const filter = {
            isAvailable: true,
        };

        if (category) {
            filter.category = category;
        }

        if (gender) {
            filter.gender = gender;
        }

        if (size) {
            filter.size = size;
        }

        if (city) {
            filter.city = {
                $regex: city,
                $options: "i",
            };
        }

        if (color) {
            filter.color = {
                $regex: color,
                $options: "i",
            };
        }

        if (condition) {
            filter.condition = condition;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.rentalPricePerDay = {};

            if (minPrice !== undefined) {
                filter.rentalPricePerDay.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.rentalPricePerDay.$lte = Number(maxPrice);
            }
        }

        const clothes = await Cloth.find(filter)
            .populate("lenderId", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Clothing search successful",
            count: clothes.length,
            clothes,
        });
    } catch (err) {
        console.error("Search clothes error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};
