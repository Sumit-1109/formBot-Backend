const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const File = require('../schema/file.schema');
const Form = require('../schema/form.schema');
const {auth} = require('../middlewares/auth');


router.get('/:fileId', auth, async (req,res) => {
    const {fileId} = req.params;
  
    try{
      const file = await File.findById(fileId).populate('forms');
  
      if(!file) {
        return res.status(404).json({message: 'File not found'});
      }
  
      return res.status(200).json({file});
  
    } catch (err) {
        console.log('Error fetching form:', err);
      res.status(500).json({message: 'Server Error'});
    }
  });


  module.exports = router;