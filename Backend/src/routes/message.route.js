import express from 'express';
import { getAllcontacts, getmessagesByuserId, sendmessage } from '../controllers/mesaage.controllers.js';
import { protect } from '../middleware/auth.middleware.js';

const Router = express.Router();

Router.get("/contacts",protect,getAllcontacts)
Router.get("/:id",protect,getmessagesByuserId)
Router.post("/send/:id",protect,sendmessage)

export default Router;