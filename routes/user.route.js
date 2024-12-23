const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../schema/user.schema");
const WorkSpace = require("../schema/workspace.schema");

router.post('/signup', async (req, res) => {
    const {userName, email, password, confirmPassword} = req.body;

    if (!userName|| !email || !password) {
        return res.status(400).json({field: 'general', message: "Please fill in all details"});
    }

    const trimmedUserName = userName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
  

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(trimmedEmail)){
        return res.status(400).json({field: "email", message: "Invalid email address"});
    }

    const userNameRegex = /^[a-zA-Z\s\.\'\-]+$/;
    if (!userNameRegex.test(trimmedUserName)){
        return res.status(400).json({field: "userName", message: "No special characters"})
    }

    if (password.length < 4) {
        return res.status(400).json({field: "password", message: "At least 4 characters"});
    }

    if(password !== confirmPassword) {
        return res.status(400).json({field: "confirmPassword", message: "Enter same password in both fields"});
    }

    try{
        const isEmailRegistered = await User.findOne({email: trimmedEmail});

        if (isEmailRegistered) {
            return res.status(400).json({field: "general", message: "Email already registered"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

        const user = await User.create({
            userName: trimmedUserName,
            email: trimmedEmail,    
            password: hashedPassword
        });

        const workspace = await WorkSpace.create({
            name: `${trimmedUserName}'s Workspace`,
            owner: user._id,
            ownerEmail: trimmedEmail
        })

        await user.save();
        await workspace.save();

        return res.status(201).json({message: "User Created Successfully !!"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({field: 'general', message: "Internal Server Error", error: err});
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
            id: user._id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        })

        return res.status(200).json({message: "Login Successfull", token, userId: user._id});
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.get('/:userId/theme', async(req,res) => {
    const {userId} = req.params;

    try{
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({theme: user.theme});

    } catch (err) {
        res.status(500).json({message: 'Server Error', error: err, theme: false});
    }
});

router.post('/:userId/theme', async (req,res) => {
    const {userId} = req.params;
    const {theme} = req.body;

    try{
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.theme = theme;
        await user.save();

        res.status(200).json({message: 'Theme Updated Successfully'});
    } catch (err) {
        res.status(500).json({message: "Server error", error: err});
    }
});

module.exports = router;