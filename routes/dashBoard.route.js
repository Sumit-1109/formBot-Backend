const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { auth } = require("../middlewares/auth");

dotenv.config();

const User = require("../schema/user.schema");
const Dashboard = require("../schema/dashBoard.schema");
const { default: mongoose } = require("mongoose");

router.get("/", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User ID is not valid" });
    }

    const dashBoard = await Dashboard.findOne({ owner: req.user.id }).populate("folders").populate("files");

    if (!dashBoard) {
      return res.status(404).json({ message: "No Dashboard found" });
    }

    return res.status(200).json({ dashBoard });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err });
  }
});

router.get('/shared', auth, async (req, res) => {
  try {
      const userId = req.user.id;

      const dashboards = await Dashboard.find({
          "sharedWith.user": userId
      })
      .populate("owner", "userName email");


      if (!dashboards || dashboards.length === 0) {
          return res.status(404).json({ message: "No shared dashboards found" });
      }


      const result = dashboards.map(dashboard => {
          const sharedUser = dashboard.sharedWith.find(shared => 
              shared.user.toString() === userId
          );

          return {
              dashboardId: dashboard._id,       
              dashboardName: dashboard.name,    
              role: sharedUser.role            
          };
      });

      res.status(200).json(result);

  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
});




router.get("/shared/:dashboardId", auth, async (req, res) => {
  try {
    const { dashboardId } = req.params;
    const userId = req.user.id;

    const dashboard = await Dashboard.findOne({
      _id: dashboardId,
      "sharedWith.user": userId,
    }).populate("folders").populate("files");

    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found or no access" });
    }

    const userRole = dashboard.sharedWith.find(item => item.user.toString() === userId).role;

    return res.status(200).json({ dashboard, role: userRole });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});




module.exports = router;