import express from "express";
import { signUp } from "../controllers/auth.controllers.js";

const Router = express.Router();

Router.post("/signup",signUp)

export default Router;