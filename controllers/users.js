// Requiring user model for mongoose
const User = require("../model/user.js");

// GET signup Route - gets to the form for user signup details entry
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// POST sign Route - posts the user details in the backend
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

// GET login Route - gets to the form for user login credentials entry
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// GET login Route - gets to the form for user login credentials entry
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// GET logout Route - Logout the user from the current session
module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
  });
  req.flash("success", "You are logged out!");
  res.redirect("/listings");
};
