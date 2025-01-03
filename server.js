const express = require('express');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));

const PORT = process.env.PORT || 8000;
const connectDB = require('./connectDB/connectDB');

const userRoutes = require('./routes/user.route');
const dashBoardRoutes = require('./routes/dashBoard.route')
const workspaceRoutes = require('./routes/workspace.route');
const folderRoutes = require('./routes/folder.route');
const fileRoutes = require('./routes/file.route');
const formRoutes = require('./routes/form.route');
const sharedDashboardRoute = require('./routes/shareDashboard.route');

app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashBoardRoutes);
app.use('/api/folder', folderRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/form', formRoutes);
app.use('/api/share/dashboard/', sharedDashboardRoute );

connectDB().then(() => {
    app.listen(PORT, (err) => {
        if (err) {
            console.error(err);
        }
        console.log(`Server is running successfully on port: ${PORT}`);
    });
}).catch((err) => {
    console.error(err);
})