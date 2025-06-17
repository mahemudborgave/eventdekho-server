import express from "express";
import User from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import cors from 'cors'
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const ifUserExist = await User.findOne({ email });
        if (ifUserExist) {
            return res.status(400).json({ message: "User already exist !" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        })

        await newUser.save();

        res.status(200).json({ message: "Sign Up Successful" });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const isUserExist = await User.findOne({ email });
        if (!isUserExist) {
            return res.status(400).json({ message: "User does not exist !" })
        }

        const isPasswordMatch = await bcrypt.compare(password, isUserExist.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect Password" })
        }

        const token = await jwt.sign(
            {
                username: isUserExist.name,
                role: isUserExist.role
            },
            secret
        );

        console.log(isUserExist.name);
        res.status(200).json(
            {
                message: "Login Successful",
                user: isUserExist,
                token
            }
        );
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
})

export default router;