import express from "express";
import { login, logout, signUp } from "../controllers/auth.controllers.js";

const Router = express.Router();

Router.post("/signup",signUp)

Router.post("/login",login)

Router.post("/logout",logout)

export default Router;