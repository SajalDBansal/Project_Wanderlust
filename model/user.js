// Requiring and setting up mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Requiring passport mongoose to allow authentication
const passportLocalMongoose = require("passport-local-mongoose");

// Creating user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// User plugin for hashing and salting the username & password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
