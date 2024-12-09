// Requiring and setting up express
const express = require("express");

// Setting up express router to read listing paths
const router = express.Router();

// Requiring user model for mongoose
const User = require("../model/user.js");

// Requiring listing model for mongoose
const Listing = require("../model/listing.js");

// Requiring wrapAsync function for error handling
const wrapAsync = require("../utils/wrapAsync.js");

// Requiring ExpressError class to handle custom errors
const ExpressError = require("../utils/ExpressError.js");

// Requiring passport & its variable npm packages
const passport = require("passport");

// Adding middleware to access the past searched page before login
const { saveRedirectUrl } = require("../middleware.js");

/*//Demo route for user model testing
app.get("/demouser", async (req, res) => {
  const fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});*/

// GET signup Route - gets to the form for user signup details entry
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// POST sign Route - posts the user details in the backend
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
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
  })
);

// GET login Route - gets to the form for user login credentials entry
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// GET login Route - gets to the form for user login credentials entry
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back to wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  })
);

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
  });
  req.flash("success", "You are logged out!");
  res.redirect("/listings");
});

module.exports = router;
