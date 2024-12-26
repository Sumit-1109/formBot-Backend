const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
let blackListedTokens = [];

dotenv.config();

const auth = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({message: "Access denied. Not logged in !!"});
    }

    if(blackListedTokens.includes(token)){
        return res.status(401).json({message: "Access denied. Token blacklisted!!"});
    }

    try{
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = tokenDecoded;
        next();
    } catch (err) {

        if (err.name === 'TokenExpiredError'){
            return res.status(401).json({message: "Token expired. Please login again"});
        }
        console.log(err);
        return res.status(400).json({message: "Invalid Token"});
    }
};


module.exports = {auth, blackListedTokens};