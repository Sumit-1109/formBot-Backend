const express = require("express");
const router = express.Router();
const User = require('../schema/user.schema');
const Form = require('../schema/form.schema');
const SharedForm = require('../schema/sharedForm.schema');
const {auth} = require('../middlewares/auth');

router.get('/:formId/link', auth, async(req, res) => {
    const {formId} = req.params;

    try{
        const form = await Form.findById(formId);

        if(!form) {
            return res.status(400).json({
                message: 'Form not found'
            });
        }

        const link = `${process.env.CLIENT_URL}/form/${formId}`;

        res.status(200).json({link});
    }catch(err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal server error',
        })
    }
});

router.get('/form/:formId', async (req, res) => {
    const {formId} = req.params;

    try{
        const form = await Form.findById(formId).populate('elements');
        if(!form) {
            return res.status(400).json({
                message: 'Form not found'
            })
        }

        res.status(200).json({
            message: 'Form Fetched Successfully',
            form,
            elements: form.elements
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    };
})

router.post('/:formId/shared/status'), async (req, res) => {
    const {formId} = req.params;
    const {userId, status} = req.body;

    if(!['viewed', 'started', 'completed'].includes(status)) {
        return res.status(400).json({
            message: 'Invalid status'
        });
    }

    try{
        const sharedForm = await SharedForm.findOneAndUpdate(
            {
                form: formId, 
                'sharedWith.user' : userId
            },
            {
                $set: {
                    'sharedWith.$.status' : status
                }
            },
            {
                new: true
            }
        );

        if(!sharedForm){
            return res.status(404).json({
                message: 'Shared form not found'
            });
        };

        res.status(200).json({
            message: 'Status updated successfully',
            sharedForm
        });
    } catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message
        });
    }
}