import express from 'express';
import { addCloth, updateCloth, deleteCloth, getAllClothes, getClothById, getMyClothes, searchClothes } from '../controller/Cloth.controller.js';
import { protect } from '../middleware/Auth.middleware.js';

const clothRoute = express.Router();

// Public routes: allow browsing and searching clothes without authentication
clothRoute.get("/", getAllClothes);
clothRoute.get("/search", searchClothes);
clothRoute.get("/:id", getClothById);

// Protected routes: require user to be logged in
clothRoute.get("/my", protect, getMyClothes);
clothRoute.post("/", protect, addCloth);
clothRoute.put("/:id", protect, updateCloth);
clothRoute.delete("/:id", protect, deleteCloth);

export default clothRoute;
