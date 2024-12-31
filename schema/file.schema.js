const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null,
    },
    dashboard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dashboard'
    },
    forms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form'
    }]
});

module.exports = mongoose.model("File", fileSchema);

