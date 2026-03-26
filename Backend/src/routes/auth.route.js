import express from "express";

const Router = express.Router();

Router.get("/signup",(req,res) => {
    res.send("sign up end point here ")
})

export default Router;