import express from 'express';
import { getAllUsers , blockSeller , unblockSeller , updateProfile } from '../controller/User.controller.js';
import { protect } from '../middleware/Auth.middleware.js';

const userRoutes = express.Router();

userRoutes.get("/profile" , protect , getAllUsers);
userRoutes.put("/profile/:id" , protect , updateProfile);
userRoutes.post("/profile/:id/block" , protect , blockSeller);
userRoutes.post("/profile/:id/unblock" , protect , unblockSeller);

export default userRoutes;