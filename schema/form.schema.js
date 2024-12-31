const mongoose = require('mongoose');

const formElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'gif', 'inputText', 'inputEmail', 'inputPhone', 'inputDate', 'inputRating', 'inputButtons', 'inputNumber']
  },
  id: {
    type : String,
    required: true
  },
  content: { 
    type: String, 
    required: false
  },
  heading :{
    type: String,
    required: true
  }
});

const formSchema = new mongoose.Schema({
  formName: {
    type: String
  },
  elements: [formElementSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('Form', formSchema);
