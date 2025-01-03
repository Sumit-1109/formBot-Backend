const express = require('express');
const router = express.Router();
const Form = require('../schema/form.schema');
const Response = require('../schema/response.schema');
const SharedForm = require('../schema/sharedForm.schema');
const { auth } = require('../middlewares/auth');
const File = require("../schema/file.schema");
const dotenv = require('dotenv');
dotenv.config();

router.post("/save", auth, async (req, res) => {
    const { formName, elements, fileId } = req.body;
    const userId = req.user.id;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
    }

    if (!fileId) {
        return res.status(400).json({ message: "File ID not found" });
    }

    if (!elements || elements.length === 0) {
        return res.status(400).json({ message: "No elements to save" });
    }

    try {
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }


        let form = file.forms.length > 0 ? await Form.findById(file.forms[0]) : null;

        if (form) {

            form.formName = formName;
            form.elements = elements;

            await form.save();
        } else {

            form = new Form({
                formName,
                elements,
                user: userId,
            });

            await form.save();


            file.forms.push(form._id);
            await file.save();
        }

        res.status(201).json({ message: "Form saved successfully", form });
    } catch (err) {
        console.error("Error saving form:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});


router.get("/:fileId", auth, async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await File.findById(fileId).populate({
            path: 'forms',
            populate: {
                path: 'elements',
            },
        });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const form = file.forms[0] || null; // Assuming the first form is fetched
        return res.status(200).json({ file, form });
    } catch (err) {
        console.error("Error fetching file and form:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

module.exports = router;

router.get('/:formId/link', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    const link = `${process.env.CLIENT_URL}/form/${req.params.formId}`;
    res.status(200).json({ link });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});


router.post('/:formId/respond', async (req, res) => {
  const { responses } = req.body;
  try {
    const response = new Response({ form: req.params.formId, responses });
    await response.save();
    res.status(201).json({ message: 'Response saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;