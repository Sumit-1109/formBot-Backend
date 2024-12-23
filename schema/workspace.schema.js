const mongoose  = require("mongoose");

const workspaceSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    ownerEmail:{
        type: String,
        required: true,
        unique: true
    },
    folders: [
        {
            folderName:{
                type: String,
                required: true
            },
            forms:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Form'
                }
            ]
        }
    ],
    forms : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Form'
        }
    ],
    collaborators: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ["editor", "viewer"],
                default: "viewer"
            }
        }
    ]
});

module.exports = mongoose.model("Workspace", workspaceSchema);