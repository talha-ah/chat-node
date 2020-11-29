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
  const email = req.body.email;
  const dob = req.body.dob;
  const password = req.body.password;

  try {
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      const err = new Error("User already exists with that email!");
      err.status = 404;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      password: hashedPassword,
      email: email,
    });
    const userSaved = await user.save();

    res.status(200).json({ registered: true, user: userSaved });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("No user found with that email!");
      err.status = 404;
      throw err;
    }

    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      const err = new Error("No user found with that combination!");
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
    const user = await User.findOne({ email });

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
