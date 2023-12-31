const User = require("../models/User");
const { sendMail } = require("./SendMail");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const verifyUser = require("../models/verifyUser");
dotenv.config();
async function InsertVerifyUser(name, email, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = generateToken(email);

    const newUser = new verifyUser({
      name: name,
      email: email,
      password: hashedPassword,
      token: token,
    });
    console.log(newUser);

    const activationLink = `https://auth-backend-eqg0.onrender.com/signin/${token}`;
    const content = `<h4> hi, there </h4>
    <h5>Welcome to the app</h5>
    <p>Thank you for signing up.<a href="${activationLink}"> Click here</a> to activate</p>
    <p>Regards</p>
    <p>Team</p>`;

    await newUser.save();
    sendMail(email, "VerifyUser", content);
  } catch (e) {
    console.log(error);
  }
}

function generateToken(email) {
  const token = jwt.sign(email, process.env.signup_Secret_Token);
  return token;
}

async function InsertSignUpUser(token) {
  try {
    const userVerify = await verifyUser.findOne({ token: token });
    if (userVerify) {
      const newUser = new User({
        name: userVerify.name,
        email: userVerify.email,
        password: userVerify.password,
        forgetPassword: {},
      });
      await newUser.save();
      await userVerify.deleteOne({ token: token });
      const content = `<h4> Registration successfull </h4>
    <h5>Welcome to the app</h5>
    <p>You are successfully registered</p>
    <p>Go back to site and click on login to continue</p>
    <p>Regards</p>
    <p>Team</p>`;
      sendMail(newUser.email, "Registration successful", content);
      return `<h4> hi, there </h4>
    <h5>Welcome to the app</h5>
    <p>You are successfully registered</p>
    <p>Go back to site and click on login to continue</p>
    <p>Regards</p>
    <p>Team</p>`;
    }
    return `<h4> Registraion failed </h4>
    <p>Link expired........</p>
    <p>Regards</p>
    <p>Team</p>`;
  } catch (error) {
    console.log(error);
    return `<html><body><h4> Registraion failed </h4>
    <p>Unexpected error happened...</p>
    <p>Regards</p>
    <p>Team</p></body></html>`;
  }
}

module.exports = { InsertVerifyUser, InsertSignUpUser };
