const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const {auth} = require('../middlewares/auth');

dotenv.config();

const User = require("../schema/user.schema");
const WorkSpace = require('../schema/workspace.schema');
const { default: mongoose } = require("mongoose");

router.get('/dashboard', auth, async (req, res) => {


    try{
        const workspace = await WorkSpace.findOne({owner: req.user.id});

        if(!workspace){
            return res.status(404).json({message: "No workspace found"})
        }
        return res.status(200).json({workspace})
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.get('/:workspaceId/folder/:folderId', auth, async (req, res) => {

    const {workspaceId, folderId} = req.params;

    try{
        const workspace = await WorkSpace.findById(workspaceId);

        if (!workspace){
            return res.status(400).json({message: "Workspace not found"});
        };
        
        const folder = await workspace.folders.id(folderId);

        if (!folder){
            return res.status(400).json({message: "Folder not found"});
        }

        return res.status(200).json({folder: {
            _id: folder._id,
            folderName: folder.folderName,
            forms: folder.forms,
        }});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.post('/:workspaceId/createFolder', auth, async(req, res) => {
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

        return res.status(201).json({message: "Folder Created Successfully", workspace});

    } catch (err) {
        res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.post('/:workspaceId/createForm', auth, async  (req, res) => {
    const {workspaceId} = req.params;
    const {formName} = req.body;

    if (!formName) {
        return res.status(400).json({message: "Form name is required"});
    }

    try{
        const workspace = await WorkSpace.findById(workspaceId);

        if (!workspace){
            return res.status(400).json({message: "Workspace not found!!"});
        };

        const newForm = {formName: formName};
        workspace.forms.push(newForm);
        await workspace.save();

        return res.status(201).json({message: "Form created successfully", workspace});
    } catch(err) {
        res.status(500).json({message: "Internal Server Error", error: err});
        console.log(err);
    }
});

router.post('/:workspaceId/folder/:folderId/createForm' , auth, async (req, res) => {
    const {workspaceId, folderId} = req.params;
    const {formName} = req.body;

    if (!formName) {
        return res.status(400).json({message: 'Form Name is required'});
    }

    try{

        if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(folderId)) {
            return res.status(400).json({ message: "Invalid workspace or folder ID" });
        }

        const workspace = await WorkSpace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found!" });
        }

        const folder = workspace.folders.id(folderId);

        if (!folder) {
            return res.status(404).json({message: "Folder not found"})
        }

        if (folder.forms.some((form) => form.formName === formName)) {
            return res.status(409).json({ message: "Form with this name already exists in the folder" });
        }

        const newForm = {_id: new mongoose.Types.ObjectId(), formName};
        folder.forms.push(newForm);

        await workspace.save();

        return res.status(201).json({
            message: "Form created successfully",
            folder: {
                _id: folder._id,
                folderName: folder.folderName,
                forms: folder.forms.map(({_id, formName}) => ({_id, formName})),
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.delete('/:workspaceId/folder/:folderId', auth, async (req, res) => {
    const {workspaceId, folderId} = req.params;

    try{
        const workspace = await WorkSpace.findById(workspaceId);

        if(!workspace) {
            return res.status(404).json({message: "Workspace not found!!"});
        }

        const folderIndex = workspace.folders.findIndex(folder => folder._id.toString() === folderId);

        if (folderIndex === -1) {
            return res.status(404).json({message: 'Folder not found'});
        }

        workspace.folders.splice(folderIndex, 1);
        
        await workspace.save();

        return res.status(200).json({
            message: "Folder deleted successfully",
            workspace
        });

        
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error", error: err});
    }
});

router.delete('/:workspaceId/form/:formId', auth, async (req, res) => {
    const {workspaceId, formId} = req.params;

    try{
        const workspace = await WorkSpace.findById(workspaceId);

        if(!workspace) {
            return res.status(404).json({message: "Workspace not found!!"});
        };

        const formIndex = workspace.forms.findIndex(form => form._id.toString() === formId);

        if (formIndex === -1) {
            return res.status(404).json({message: 'Form not found'});
        };

        workspace.forms.splice(formIndex, 1);

        await workspace.save();

        return res.status(200).json({
            message: "Form deleted successfully",
            workspace
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal Server Error", error: err});
    }
});

module.exports = router;