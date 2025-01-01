const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const {auth} = require('../middlewares/auth');

const Dashboard = require('../schema/dashBoard.schema');
const Folder = require('../schema/folder.schema');
const File = require('../schema/file.schema');

router.post("/:dashBoardId/createfile", auth, async (req, res) => {
  const { dashBoardId } = req.params;
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ message: "Form name is required" });
  }

  try {

    if(!mongoose.Types.ObjectId.isValid(dashBoardId)){
        return res.status(400).json({ message: "Invalid dashboard id" });
    }

    const dashBoard = await Dashboard.findById(dashBoardId)
    .populate("folders")
    .populate("files");

    if (!dashBoard) {
      return res.status(400).json({ message: "Dashboard not found!!" });
    }

    const doesFileExist = await File.findOne({
        name: fileName,
        folder: null,
        dashBoard: dashBoardId
    });


    if (doesFileExist) {
      return res.status(400).json({ message: "Form name already exists!!" });
    }

    const file = new File({
        name: fileName,
        folder: null,
        dashBoard: dashBoardId
    });

    await file.save();
    dashBoard.files.push(file._id);
    await dashBoard.save();

    const updatedDashBoard = await Dashboard.findById(dashBoardId)
    .populate("folders")
    .populate("files");

    return res
      .status(201)
      .json({ message: "Form created successfully", dashBoard: updatedDashBoard });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
    console.log(err);
  }
});

router.post(
  "/:dashBoardId/folder/:folderId/createfile",
  auth,
  async (req, res) => {
    const { dashBoardId, folderId } = req.params;
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ message: "Form Name is required" });
    }

    try {
      if (
        !mongoose.Types.ObjectId.isValid(dashBoardId) ||
        !mongoose.Types.ObjectId.isValid(folderId)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid Dashboard or folder ID" });
      }

      const dashBoard = await Dashboard.findById(dashBoardId)
      .populate("folders")
      .populate("files");

      if (!dashBoard) {
        return res.status(404).json({ message: "Dashboard not found!" });
      }

      const folder = await Folder.findById(folderId).populate('files');

      if (!folder || folder.dashBoard.toString() !== dashBoardId) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const doesFileExist = await File.findOne({
        name: fileName,
        folder: folderId,
        dashBoard: dashBoardId
      });

      if(doesFileExist) {
        return res.status(400).json({ message: "File already exists" });
      }

      const file = new File({
        name: fileName,
        dashBoard: dashBoardId,
        folder: folderId,
      });


      await file.save();

      folder.files.push(file._id);
      await folder.save();

      const updatedFolder = await Folder.findById(folderId).populate('files');


      return res.status(201).json({
        message: "Form created successfully",
        file,
        folder: updatedFolder,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error", error: err });
    }
  }
);

router.get("/:dashBoardId/files", auth, async (req, res) => {
    const {dashBoardId} = req.params;
    try{
        const files = await File.find({dashBoard: dashBoardId, folder: null});

        return res.status(200).json({files});
    } catch (err) {
        return res.status(500).json({message: "Internal server error", error: err})
    }

});

router.get("/:dashboardId/folder/:folderId/files", auth, async (req,res) => {
    const {dashboardId, folderId} = req.params;

    try{
        const files = await File.find({dashBoard: dashboardId, folder: folderId});

        return res.status(200).json({files});
    } catch (err) {
      console.log(err);
        return res.status(500).json({message: "Internal server error", error: err})
    }
});


router.delete('/:dashBoardId/file/:fileId', auth, async (req, res) => {

    const {dashBoardId, fileId} = req.params;

    try{
        if(!mongoose.Types.ObjectId.isValid(dashBoardId) || !mongoose.Types.ObjectId.isValid(fileId)){
            return res.status(400).json({message: "Invalid file or dashboard id"})
        }

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({message: "File not found"});
        }

        await file.deleteOne();

        return res.status(200).json({message: "File deleted"});
    } catch (err) {
      console.log(err);
        return res.status(500).json({message: "Internal server error", error: err})
    }
});


router.delete("/:dashBoardId/folder/:folderId/:fileId", auth, async (req, res) => {
    const {dashBoardId, folderId, fileId} = req.params;


    try{
        if(
            !mongoose.Types.ObjectId.isValid(dashBoardId) ||
            !mongoose.Types.ObjectId.isValid(folderId) ||
            !mongoose.Types.ObjectId.isValid(fileId)
        ) {
            return res.status(400).json({message: "Invalid ID"});
        }

        const folder = await Folder.findById(folderId).populate('files');

        if(!folder){
            return res.status(404).json({message: "Folder not found"});
        }

        const isFileInFolder = folder.files.some(
          (folderFile) => folderFile._id.toString() === fileId
      );

      if (!isFileInFolder) {
          return res.status(404).json({ message: "File not found in folder" });
      }


      folder.files = folder.files.filter(
          (folderFile) => folderFile._id.toString() !== fileId
      );

      await folder.save();

      await File.findByIdAndDelete(fileId);

      const updatedFolder = await Folder.findById(folderId).populate('files');

        return res.status(200).json({message: "File deleted from folder", updatedFiles: updatedFolder.files});

    } catch (err) {
        return res.status(500).json({message: "Internal server error", error: err})
    }

});

module.exports = router;