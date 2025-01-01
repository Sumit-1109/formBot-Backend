const express = require("express");
const router = express.Router();


const { auth } = require("../middlewares/auth");

const Dashboard = require ('../schema/dashBoard.schema');
const Folder = require('../schema/folder.schema');
const { default: mongoose } = require("mongoose");

router.get("/:dashBoardId/folder/:folderId", auth, async (req, res) => {
  const { dashBoardId, folderId } = req.params;

  try {
    const dashBoard = await Dashboard.findById(dashBoardId)
    .populate("folders")
    .populate("files");

    if (!dashBoard) {
      return res.status(400).json({ message: "Dashboard not found" });
    }

    const folder = await Folder.findById(folderId).populate("files");

    if (!folder || folder.dashBoard.toString() !== dashBoardId) {
      return res.status(400).json({ message: "Folder not found" });
    }

    return res.status(200).json({
      folder: {
        _id: folder._id,
        folderName: folder.name,
        files: folder.files,
      },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err });
  }
});

router.post("/:dashBoardId/createfolder", auth, async (req, res) => {
  const { dashBoardId } = req.params;
  const { folderName } = req.body;
  console.log("Create Folder Endpoint Hit");
    console.log("Params:", req.params);
    console.log("Body:", req.body);


  if (!folderName) {
    return res.status(400).json({ message: "Folder name is required" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(dashBoardId)) {
      return res.status(400).json({ message: "Invalid ID" });
  }


    const dashBoard = await Dashboard.findById(dashBoardId).populate("folders")
    .populate("folders")
    .populate("files");

    if (!dashBoard) {
      return res.status(400).json({ message: "Dashboard not found!!" });
    }

    const doesFolderNameExist = await Folder.findOne({
        name: folderName,
        dashBoard: dashBoardId
    });

    if (doesFolderNameExist) {
      return res.status(400).json({ message: "Folder name already exists!!" });
    }

    const folder = new Folder({
        name: folderName,
        dashBoard: dashBoardId
    });

    await folder.save();
    dashBoard.folders.push(folder._id);
    await dashBoard.save();

    const updatedDashBoard = await Dashboard.findById(dashBoardId)
    .populate("folders")
    .populate("files");

    return res
      .status(201)
      .json({ message: "Folder Created Successfully", dashBoard: updatedDashBoard });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

router.delete("/:dashBoardId/folder/:folderId", auth, async(req, res) => {
    const { dashBoardId, folderId } = req.params;

    try{
        if (!mongoose.Types.ObjectId.isValid(dashBoardId) || !mongoose.Types.ObjectId.isValid(folderId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const folder = await Folder.findById(folderId).populate("files");

        if(!folder || folder.dashBoard.toString() !== dashBoardId){
            return res.status(400).json({ message: "Folder not found!!" });
        }

        if (folder.files.length) {
          await File.deleteMany({ _id: { $in: folder.files } });
        }
        await Folder.findByIdAndDelete(folderId);
        

        const dashBoard = await Dashboard.findById(dashBoardId).populate('folders').populate('files');
        
    if (dashBoard) {
      dashBoard.folders = dashBoard.folders.filter(
        (dashFolderId) => dashFolderId.toString() !== folderId
      );
      await dashBoard.save();
    }

    await folder.deleteOne();

    return res.status(200).json({message: "Folder Deleted Successfully"});
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error", error: err});
    }
})

module.exports = router;
