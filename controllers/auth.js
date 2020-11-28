const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");

// Import Models
const User = require("../models/user");

exports.register = async (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const userName = req.body.userName;
  const password = req.body.password;
  const email = req.body.email;

  try {
    const userCheck = await User.findOne({ email: email });
    if (userCheck) {
      const err = new Error("User already exists with that email!");
      err.status = 404;
      throw err;
    }

    const userCheck2 = await User.findOne({ userName });
    if (userCheck2) {
      const err = new Error("Username is not available!");
      err.status = 404;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      userName: userName,
      password: hashedPassword,
      email: email,
    });
    const userSaved = await user.save();

    res.status(200).json({ user: userSaved });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const authString = req.body.authString;
  const password = req.body.password;

  try {
    const user = await User.findOne({
      $or: [{ userName: authString }, { email: authString }],
    });
    if (!user) {
      const err = new Error("No user found with that email or username.");
      err.status = 404;
      throw err;
    }

    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      const err = new Error("Incorrect password.");
      err.status = 402;
      throw err;
    }

    var token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.MY_SECRET_KEY
    );
    res.status(200).json({ user: user, token: token });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

exports.forgetPassword = async (req, res, next) => {
  const email = req.body.email;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      var error = new Error("No user found with this email!");
      error.status = 404;
      throw error;
    }
    if (user.status === "inactive") {
      var error = new Error(
        "Your account is not active! Kindly contact support!"
      );
      error.status = 403;
      throw error;
    }

    var length = 12,
      charset =
        "#&|!@abcdefghijklmnopqrstuvwxyz#&|!@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#&|!@",
      resetPass = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      resetPass += charset.charAt(Math.floor(Math.random() * n));
    }

    const hashedPassword = await bcrypt.hash(resetPass, 12);
    user.password = hashedPassword;

    // Email Starts
    const filePath = path.join(__dirname, "../utils/resetPassword.html");
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: user.firstName + " " + user.lastName,
      email: email,
      password: resetPass,
      action_url: "https://condescending-davinci.netlify.app/",
    };
    const htmlToSend = template(replacements);
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ariaylake@gmail.com",
        pass: "shutdown12",
      },
    });
    const mailOptions = {
      from: "ariaylake@gmail.com",
      to: email,
      subject: "Password Reset Request",
      // text: url,
      html: htmlToSend,
    };

    await transporter.sendMail(mailOptions);
    await teacher.save();
    res.status(200).json({ message: "Email sent!" });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};
