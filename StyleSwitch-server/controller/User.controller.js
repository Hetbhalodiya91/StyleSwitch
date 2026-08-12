import mongoos from 'mongoose';
import User from '../model/User.model.js';


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            message: "Users fetched successfully",
            users,
        });
    } catch (err) {
        console.error("Get all users error:", err);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};




export const blockSeller = async (req , res)=>{
    try{

        const {id} = req.params;
                if (!id) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message : "User not found"});
        }

        if(user.isBlock){
            return res.status(400).json({message: "User is already blocked"});
        }

        user.isBlock = true;
        user.save();

        res.status(200).json({message : "User blocked succesfully"});


    }catch(err){
        res.status(500).json({
            message: err.message,
        });
    }
}

export const unblockSeller = async (req , res)=>{
    try{

        const {id} = req.params;
                if (!id) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message : "User not found"});
        }

        if(!user.isBlock){
            return res.status(400).json({message: "User is already unblocked"});
        }

        user.isBlock = false;
        user.save();

        res.status(200).json({message : "User Unblocked succesfully"});


    }catch(err){
        res.status(500).json({
            message: err.message,
        });
    }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email, address, number } = req.body;
        const {id} = req.params;

        if (
            name === undefined &&
            email === undefined &&
            address === undefined &&
            number === undefined
        ) {
            return res.status(400).json({
                message: "At least one field is required to update",
            });
        }

        // Validate name
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 2) {
                return res.status(400).json({
                    message: "Name must be at least 2 characters",
                });
            }
        }

        // Validate email
        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    message: "Invalid email address",
                });
            }
        }

        // Validate phone number
        if (number !== undefined) {
            const phoneRegex = /^[0-9]{10}$/;

            if (!phoneRegex.test(String(number))) {
                return res.status(400).json({
                    message: "Phone number must be 10 digits",
                });
            }
        }

        // Find user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Check if new email is already in use
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                where: { email },
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email is already in use",
                });
            }

            user.email = email;
        }

        if (name !== undefined) {
            user.name = name.trim();
        }

        if (address !== undefined) {
            user.address = address.trim();
        }

        if (number !== undefined) {
            user.number = number;
        }

        await user.save();

        return res.status(200).json({
            message: "User details updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                number: user.number,
            },
        });
    } catch (err) {
        console.error("Update profile error:", err);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
