const express = require("express");
const router = express.Router();
const User = require('../schema/user.schema');
const Form = require('../schema/form.schema');
const SharedForm = require('../schema/sharedForm.schema');
const {auth} = require('../middlewares/auth');



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

