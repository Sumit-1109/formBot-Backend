const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dashBoard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dashboard',
        required: true
    },
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Folder", folderSchema);
