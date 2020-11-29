const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const header = req.get("Authorization");
    if (!header) {
      const error = new Error("Authorization header not found!");
      error.status = 400;
      next(error);
    }

    const token = header.split(" ")[1];

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.MY_SECRET_KEY);
    } catch (error) {
      if (!error.status) {
        error.status = 500;
        next(error);
      }
    }

    if (!decodedToken) {
      const error = new Error("Authorization token not validated!");
      error.status = 401;
      next(error);
    }
    req.userId = decodedToken.userId.toString();
    req.email = decodedToken.email;
    next();
  } catch (err) {
    next(err);
  }
};
