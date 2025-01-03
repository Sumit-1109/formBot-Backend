const express = require("express");
const router = express.Router();

const Form = require("../schema/form.schema");
const File = require("../schema/file.schema");
const User = require("../schema/user.schema");
const Dashboard = require('../schema/dashBoard.schema');
const { auth } = require("../middlewares/auth");

router.post("/save", auth, async (req, res) => {
    const { formName, elements, fileId } = req.body;
  
    if (!elements || elements.length === 0) {
      return res.status(400).json({ message: "No elements to save" });
    }
  
    elements.sort((a, b) => a.order - b.order);
  
    try {
      const file = await File.findById(fileId);
  
      if (!file) {
        return res.status(400).json({ message: "File not found" });
      }
  
      let form;
      if (file.forms.length > 0) {
        const formId = file.forms[0];
        form = await Form.findById(formId);
        form.formName = formName;
        form.elements = elements;
      } else {
        form = new Form({
          formName,
          elements,
          user: req.user.id,
          file: fileId
        });
        file.forms.push(form._id);
      }
  
      await form.save();
      await file.save();
      res.status(201).json({ message: "Form saved successfully", form });
    } catch (err) {
      res.status(500).json({ message: "Internal server error", error: err });
    }
  });
  

router.get("/:formId", async (req, res) => {
  const { formId } = req.params;

  try {

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    return res.status(200).json({ form, elements: form.elements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

router.post('/:formId/respond', async (req, res) => {
    const { formId } = req.params;
    const { responseId, responses } = req.body;
  
    try {
      const response = await Response.findById(responseId);
      if (!response) return res.status(404).json({ message: 'Response not found' });
  
      response.responses.push(...responses);
      await response.save();
  
      res.status(200).json({ message: 'Responses saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  });

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

// router.post("/submit", async (req, res) => {
//     const { formId, responses } = req.body;
  
//     if (!responses || responses.length === 0) {
//       return res.status(400).json({ message: "No responses provided" });
//     }
  
//     try {
//       const form = await Form.findById(formId);
  
//       if (!form) {
//         return res.status(404).json({ message: "Form not found" });
//       }
  
//       const response = new Response({
//         form: formId,
//         responses,
//       });
  
//       await response.save();
  
//       res.status(201).json({ message: "Response submitted successfully", response });
//     } catch (err) {
//       res.status(500).json({ message: "Internal server error", error: err });
//     }
//   });

//   router.get("/:formId/responses", auth, async (req, res) => {
//     const { formId } = req.params;
  
//     try {
//       const responses = await Response.find({ form: formId });
  
//       if (!responses || responses.length === 0) {
//         return res.status(404).json({ message: "No responses found" });
//       }
  
//       res.status(200).json({ responses });
//     } catch (err) {
//       res.status(500).json({ message: "Internal server error", error: err });
//     }
//   });
  

//   router.post('/:formId/start', async (req, res) => {
//     const { formId } = req.params;
  
//     try {
//       const form = await Form.findById(formId);
//       if (!form) return res.status(404).json({ message: 'Form not found' });
  
//       const response = new Response({ form: formId });
//       await response.save();
  
//       res.status(201).json({ responseId: response._id });
//     } catch (error) {
//       res.status(500).json({ message: 'Internal server error', error });
//     }
//   });
  

//   router.post('/:formId/submit', async (req, res) => {
//     const { formId } = req.params;
//     const { responseId } = req.body;
  
//     try {
//       const response = await Response.findById(responseId);
//       if (!response) return res.status(404).json({ message: 'Response not found' });
  
//       response.status = 'submitted';
//       await response.save();
  
//       res.status(200).json({ message: 'Form submitted successfully' });
//     } catch (error) {
//       res.status(500).json({ message: 'Internal server error', error });
//     }
//   });


  module.exports = router;