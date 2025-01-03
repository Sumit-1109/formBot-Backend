// models/response.schema.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  responses: [
    {
      elementId: { type: String, required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true }
    }
  ],
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['started', 'submitted'], default: 'started' }
});

module.exports = mongoose.model('Response', responseSchema);