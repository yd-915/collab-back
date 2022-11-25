const jwt = require("jsonwebtoken");
const Users = require("../models/User");
const mongoose = require("mongoose");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const decodedKey = jwt.verify(token, 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY2Nzg3Njk2NSwiaWF0IjoxNjY3ODc2OTY1fQ.T6GmJ1cyaX7hqakagsyE9oeG-HDVuuW8eZKBZSXYJmk');

    const user = await Users.findOne({
      _id: decodedKey._id,
      token: token,
      Deleted: false,
    });
    if (!user) throw new Error();

    req.token = token;
    req.user = user;
    req.Admin = false;

    if(req.user.SuperUser){
      req.Admin = true;
    }
    
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate !" });
  }
};

module.exports = auth;
