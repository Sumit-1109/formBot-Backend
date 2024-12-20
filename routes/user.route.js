const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../schema/user.schema");

router.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName|| !trimmedEmail || !trimmedPassword) {
        return res.status(400).json({message: "Please fill in all details"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(trimmedEmail)){
        return res.status(400).json({message: "Invalid email address"});
    }

    const nameRegex = /^[a-zA-Z\s\.\'\-]+$/;
    if (!nameRegex.test(trimmedName)){
        return res.status(400).json({message: "Name should not contain any special characters except . ' - and spaces !!"})
    }

    if (password.length < 4) {
        return res.status(400).json({message: "Password should be at least 4 characters"});
    }

    try{
        const isEmailRegistered = await User.findOne({email: trimmedEmail});

        if (isEmailRegistered) {
            return res.status(400).json({message: "Email already registered"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        return res.status(201).json({message: "User Created Successfully !!"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
});


router.post('/signin', async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});

        if (!user ){
            return res.status(401).json({message: "Invalid Credentials"});
        };

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({message: "Invalid Credentials"});
        };

        const payload ={
            id: user.id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        })

        return res.status(200).json({message: "Login Successfull", token});
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
});

module.exports = router;