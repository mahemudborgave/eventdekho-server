import e from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = e.Router();
const secret = process.env.JWT_SECRET;

router.post('/verifytoken', async (req, res) => {
    console.log("got the request");
    
    const token = req.headers.authorization?.split(' ')[1];
    try {
        res.json(jwt.verify(token, secret));
    }
    catch(e) {
        res.status(400).json({message:"Token is invalid"})
    }
})

export default router;