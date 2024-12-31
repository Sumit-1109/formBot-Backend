const express = require("express");
const router = express.Router();

const Form = require("../schema/form.schema");
const File = require("../schema/file.schema");
const User = require("../schema/user.schema");
const Dashboard = require('../schema/dashBoard.schema');
const { auth } = require("../middlewares/auth");

router.post("/save", auth, async (req, res) => {
  const { formName, elements, fileId } = req.body;
  const userId = req.user.id;


  if (!userId) {
    return res.status(400).json({ message: "User id not found" });
  }

  if(!fileId){
    return res.status(400).json({ message: "File id not found" });
  }

  if(!elements){
    return res.status(400).json({ message: "Elements not found" });
  }

  if(elements.length === 0){
    return res.status(400).json({ message: "No elements to save" });
  }

  try {
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(400).json({ message: "File not found" });
    }


    let form;
    if (file.forms.length > 0) {
      const formId = file.forms[0];
      form = await Form.findById(formId);

      if (!form) {
        return res.status(400).json({ message: "Existing form not found" });
      }

      form.formName = formName;
      form.elements = elements;

      await form.save();

    } else {
      form = new Form({
        formName: formName,
        elements: elements,
        fileId: fileId,
        user: userId,
      });

      await form.save();

      file.forms.push(form._id);
      await file.save();
    }

    res.status(201).json({ message: "Form saved successfully", form, formId: form._id });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

router.get("/:formId", auth, async (req, res) => {
  const { formId } = req.params;

  try {

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    return res.status(200).json({ form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
