const express = require("express");
const router = new express.Router();
const { google } = require("googleapis");
const { getAuthUrl, getGoogleUser } = require("../Function/Oauth2");
const User = require("../models/User");

//Initialising the oauth client as a global variable

global.oauth2Client = new google.auth.OAuth2(
  "728824725279-8c76st57iku3b15sk20rodrl4od7ik9s.apps.googleusercontent.com",
  "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",
  'https://iftiinback.adaptable.app/'
);

router.get("/googleOauth", async (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.status(200).send(authUrl);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

router.post("/authenticated", async (req, res) => {
  const code = req.body.code;
  console.log(req.body);
  if (!code) {
    return res
      .status(400)
      .send({ error: "Looks like there is a problem! Please try again." });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const user = await getGoogleUser(tokens);
    const isUser = await User.findOne({ Email: user.email, Verified: true });
    if (isUser) {
      if (isUser.Deleted) {
        isUser.Deleted = false;
        await isUser.save();
      }
      const token = await isUser.generateToken();
      return res.status(200).send({ user: isUser, token: token, Way: "login" });
    }
    const newUser = new User({
      Name: user.name,
      Email: user.email,
      Verified: user.verified_email,
    });

    const _Guser = await newUser.save();
    const token = await _Guser.generateToken();

    return res.status(200).send({ user: _Guser, token: token, Way: "signup" });
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
