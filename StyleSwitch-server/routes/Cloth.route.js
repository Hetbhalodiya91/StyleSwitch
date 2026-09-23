import express from 'express';
import { addCloth , updateCloth,deleteCloth , getAllClothes , getClothById , getMyClothes,searchClothes } from '../controller/Cloth.controller.js';
import { protect } from '../middleware/Auth.middleware.js';

const clothRoute = express.Router();

clothRoute.get("/", protect, getAllClothes);
clothRoute.get("/my", protect, getMyClothes);
clothRoute.get("/search", protect, searchClothes);
clothRoute.get("/:id", protect, getClothById);
clothRoute.post("/", protect, addCloth);
clothRoute.put("/:id", protect, updateCloth);
clothRoute.delete("/:id", protect, deleteCloth);

export default clothRoute;