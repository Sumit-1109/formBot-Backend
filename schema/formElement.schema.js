const mongoose = require('mongoose');

const formElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'gif', 'inputText', 'inputEmail', 'inputPhone', 'inputDate', 'inputRating', 'inputButtons', 'inputNumber'],
    required: true
  },
  id: { type: String, required: true },
  content: { type: String },
  heading: { type: String, required: true },
  placeholder: { type: String, default: '' },
  order: { type: Number, required: true }
});

module.exports = formElementSchema;