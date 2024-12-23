const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const auth = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({message: "Access denied. Not logged in !!"});
    }

    try{
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: tokenDecoded.id};
        next();
    } catch (err) {
        return res.status(400).json({message: "Invalid Token"});
    }
};


module.exports = auth;