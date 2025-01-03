const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  theme: {
    type: Boolean,
    default: false,
  },
  sharedDashboards: [
    {
        dashboard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dashboard",
        },
      role: {
                type: String,
                enum: ['view', 'edit'],
                default: 'view',
            },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);