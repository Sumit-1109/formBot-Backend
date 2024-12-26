const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const {auth, blackListedTokens} = require('../middlewares/auth');

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
    if(trimmedUserName.length < 3){
        return res.status(400).json({field: 'userName', message: 'Atleast 3 characters long'});
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{}|\\,.<>/?-]{4,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
        return res.status(400).json({
            field: "password",
            message: "No white space. No comma."
        });
    }    

    if (trimmedPassword.length < 4) {
        return res.status(400).json({field: "password", message: "At least 4 characters"});
    }

    if(trimmedPassword !== trimmedConfirmPassword) {
        return res.status(400).json({field: "confirmPassword", message: "Enter same password in both fields"});
    }

    const session = await User.startSession();
    session.startTransaction();

    try{
        const isEmailRegistered = await User.findOne({email: trimmedEmail});

        if (isEmailRegistered) {
            return res.status(400).json({field: "general", message: "Email already registered"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

        const [user] = await User.create([{
            userName: trimmedUserName,
            email: trimmedEmail,    
            password: hashedPassword
        }], {session});

        const workspace = await WorkSpace.create([{
            name: `${trimmedUserName}'s Workspace`,
            owner: user._id,
            ownerEmail: trimmedEmail
        }], {session});

        await session.commitTransaction();

        return res.status(201).json({message: "User Created Successfully !!"});
    } catch (err) {

        await session.abortTransaction();
        if(err.code === 1100){
            return res.status(400).json({field: 'email', message: 'Email already registered'});
        }
        return res.status(500).json({field: 'general', message: "Internal Server Error"});
    } finally {
        session.endSession();
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

        return res.status(200).json({message: "Login Successfull", token});
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Internal Server Error"});
    }
});

router.get('/theme',auth, async(req,res) => {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({message: "Invalid User Id"});
    }

    try{
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({theme: user.theme});

    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Server Error',  theme: false});
    }
});

router.post('/theme',auth, async (req,res) => {
    const userId = req.user.id;
    const {theme} = req.body;

    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({message: "Invalid User Id"});
    }

    try{
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.theme = theme;
        await user.save();

        res.status(200).json({message: 'Theme Updated Successfully'});
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Server error"});
    }
});


router.put('/modify', auth, async (req,res) => {

    if(!req.user || !req.user.id){
        return res.status(401).json({message: "Unauthorized"});
    }

    const id = req.user.id;

    const {userName, email, oldPassword, newPassword} = req.body;

    if (!userName && !email && !oldPassword && !newPassword) {
        return res.status(400).json({message: "Nothing to update !!"});
    }

    const trimmedUserName = userName ? userName.trim() : '';
    const trimmedEmail =email ?  email.trim() : '';
    const trimmedOldPassword =oldPassword ?  oldPassword.trim() : '';
    const trimmedNewPassword =newPassword ? newPassword.trim() : '';
  

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email && (!emailRegex.test(trimmedEmail))){
        return res.status(400).json({message: "Invalid email address"});
    }


    const userNameRegex = /^[a-zA-Z\s\.\'\-]+$/;
    if (userName && (!userNameRegex.test(trimmedUserName))){
        return res.status(400).json({field: "userName", message: "No special characters"})
    }

    if (newPassword && (trimmedNewPassword.length < 4)) {
        return res.status(400).json({field: "password", message: "At least 4 characters"});
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{}|\\,.<>/?-]{4,}$/;

    if (newPassword && (!passwordRegex.test(trimmedNewPassword))) {
    return res.status(400).json({
        field: "password",
        message: "No white spaces. No comma."
    });
}



    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }

    const isValidOldPassword =oldPassword ? await bcrypt.compare(trimmedOldPassword, user.password) : true;
    const isNewPasswordSame =trimmedNewPassword && await bcrypt.compare(trimmedNewPassword, user.password);

    if(email && trimmedEmail === user.email){
        return res.status(400).json({message: "New email is same as old email"});
    }

    if(userName && trimmedUserName === user.userName){
        return res.status(400).json({message: "New user name is same as old user"});
    }

    if(email && trimmedEmail !== user.email){
        const doesEmailExists = await User.findOne({email: trimmedEmail});

        if(doesEmailExists){
            return res.status(400).json({message: "Email already exists"});
        }
    }

    if ((oldPassword && !newPassword) || (!oldPassword && trimmedNewPassword)) {
        return res.status(400).json({message: "Both old and new Password required."});
    } 
    if (!isValidOldPassword){
        return res.status(400).json({message: "Invalid old password"});
    } 
    if (isNewPasswordSame){
        return res.status(400).json({message: 'New Password should be different from Old Password'});
    }

    try{
        if (trimmedUserName) {
            user.userName = trimmedUserName;

            const workspace = await WorkSpace.findOne({owner: id});
            if(workspace) {
                workspace.name = `${trimmedUserName}'s Workspace`;
                await workspace.save();
            }
        };
        if (trimmedEmail) {
            user.email = trimmedEmail;

            const workspace = await WorkSpace.findOne({owner: id});
            if(workspace) {
                workspace.ownerEmail = trimmedEmail;
                await workspace.save();
            }
        };
        if (trimmedNewPassword){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(trimmedNewPassword, salt);
        }

        await user.save();
        res.status(200).json({message: "Successfully Updated"})
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Internal Server Error"});
    }
    

});


router.post('/logout', auth, (req, res) => {
    
    const token = req.header('Authorization');

    if(token) {
        blackListedTokens.push(token);
        return res.status(200).json({message: "Logged out successfully"});
    }

    return res.status(400).json({message: "No token provided"});
});

module.exports = router;