const mongoose = require('mongoose');

const formElementSchema = require('./formElement.schema');

const formSchema = new mongoose.Schema({
  formName: { type: String},
  elements: [formElementSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Form', formSchema);