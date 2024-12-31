const mongoose = require('mongoose');

const dashBoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    folders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }],
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    collaborator: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model("Dashboard", dashBoardSchema);
