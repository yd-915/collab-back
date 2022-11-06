const jwt = require("jsonwebtoken");
const Users = require("../models/User");
const mongoose = require("mongoose");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const decodedKey = jwt.verify(token, process.env.JWT_SECRET);

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
