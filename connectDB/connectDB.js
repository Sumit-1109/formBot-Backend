const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Successfully connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB;