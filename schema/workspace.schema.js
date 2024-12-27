const mongoose  = require("mongoose");

const workspaceSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
    ownerEmail:{
        type: String,
        required: true
    },
    folders: [
        {
            folderName:{
                type: String,
                required: true
            },
            forms:[
                {
                    formName: {
                        type: String,
                        required: true
                    },
                    form: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Form'
                    }
                }
            ],
        }
    ],
    forms : [
        {
            formName: {
                type: String,
                required: true
            },
            form: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Form'
            }
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