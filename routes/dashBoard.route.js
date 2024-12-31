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

    const dashBoard = await Dashboard.findOne({ owner: req.user.id })
      .populate("folders")
      .populate("files");

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

module.exports = router;
