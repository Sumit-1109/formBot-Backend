const mongoose = require('mongoose');

const formElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'gif', 'inputText', 'inputEmail', 'inputPhone', 'inputDate', 'inputRating', 'inputButtons', 'inputNumber']
  },
  id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false
  },
  heading: {
    type: String,
    required: true
  },
  placeholder: {
    type: String, 
    default: ''
  },
  order: {
    type: Number, 
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
  }
});

module.exports = mongoose.model('Form', formSchema);
