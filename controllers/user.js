// Import Models
const User = require("../models/user");

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      const err = new Error("There was an error!");
      err.status = 400;
      throw err;
    }

    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("There was an error!");
      err.status = 400;
      throw err;
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
