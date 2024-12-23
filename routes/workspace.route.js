const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const auth = require('../middlewares/auth');

dotenv.config();

const User = require("../schema/user.schema");
const WorkSpace = require('../schema/workspace.schema')

router.get('/:userId', auth, async (req, res) => {
    const {userId} = req.params;

    try{
        const workspace = await WorkSpace.findOne({owner: userId});

        if(!workspace){
            return res.status(404).json({message: "No workspace found"})
        }

        return res.status(200).json({workspace})
        console.log("workspace found with user id", userId, workspace)
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.post('/workspace/:workspaceId/createFolder', auth, async(req, res) => {
    const {workspaceId} = req.params;
    const {folderName} = req.body;

    if (!folderName) {
        return res.status(400).json({message: "Folder name is required"});
    }


    try{
        const workspace = await WorkSpace.findById(workspaceId);

        if(!workspace){
            return res.status(400).json({message: "Workspace not found!!"});
        };

        const doesFolderNameExist = workspace.folders.some(folder => folder.folderName === folderName);

        if(doesFolderNameExist) {
            return res.status(400).json({message: "Folder name already exists!!"});
        }

        const newfolder = {
            folderName,
            forms: []
        }

        workspace.folders.push(newfolder);

        await workspace.save();

        return res.status(201).json({message: "Folder Created Successfully", folder: newfolder});

    } catch (err) {
        res.status(500).json({message: "Internal Server Error", error: err});
    }
});

module.exports = router;