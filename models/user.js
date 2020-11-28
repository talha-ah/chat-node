const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: Number,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  notifications: [{}],
});

module.exports = mongoose.model("User", UserSchema);

// function obfuscate(cc) {
//   return "****-****-****-" + cc.slice(cc.length - 4, cc.length);
// }

// var AccountSchema = new Schema({
//   creditCardNumber: { type: String, get: obfuscate },
// });

// var Account = mongoose.model("Account", AccountSchema);

// Account.findById(someId, function (err, found) {
//   console.log(found.creditCardNumber); // '****-****-****-1234'
// });

// Course
//         .findById(req.params.courseId)
//         .populate({
//             path: 'classes',
//             model: 'Classroom',
//             populate: {
//                 path: 'instructors',
//                 model: 'User'
//             }
//         })
//         .exec(function(err, cour) {
//             if (err)
//                 console.log(err);
//             else {
//                 Course.populate(cour,
//                     {
//                         path: 'classes.location',
//                         model: 'Location',
//                     }, function(err, c1) {
//                         if (err)
//                             console.log(err);
//                         else
//                             console.log(util.inspect(c1, { showHidden: true, depth: null }));
//                     })
//             }
//         })

// company: this
// company: [UserSchema]

// person.anything = { x: [3, 4, { y: "changed" }] };
// person.markModified('anything');
// person.save(); // Mongoose will save changes to `anything`

// let x = {a: 1, b: 2, c: 3, z:26};
// let {b, ...y} = x;
