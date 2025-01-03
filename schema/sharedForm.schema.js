const mongoose = require('mongoose');

const sharedFormSchema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
    },
    sharedWith: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            status: {
                type: String,
                enum: ['sent', 'viewed', 'started', 'completed'],
                default: 'sent',
            },
            responses: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                        required: true,
                    },
                    response: {
                        type: mongoose.Schema.Types.Mixed,
                        required: true
                    },
                    submittedAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ]
});

module.exports = mongoose.model('SharedForm', sharedFormSchema);