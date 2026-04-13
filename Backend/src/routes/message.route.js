import express from 'express';
import { getAllcontacts, getChatpartners, getmessagesByuserId, sendmessage } from '../controllers/mesaage.controllers.js';
import { protect } from '../middleware/auth.middleware.js';

const Router = express.Router();

Router.use(protect)

Router.get("/contacts",getAllcontacts)
Router.get("/chatPartners",getChatpartners)
Router.get("/:id",getmessagesByuserId)
Router.post("/send/:id",sendmessage)

export default Router;