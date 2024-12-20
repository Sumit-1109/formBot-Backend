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

