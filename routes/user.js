// Requiring and setting up express
const express = require("express");

// Setting up express router to read listing paths
const router = express.Router();

// Requiring wrapAsync function for error handling
const wrapAsync = require("../utils/wrapAsync.js");

// Requiring passport & its variable npm packages
const passport = require("passport");

// Adding middleware to access the past searched page before login
const { saveRedirectUrl } = require("../middleware.js");

// Requiring funntionality of routes from controlloer files
const userController = require("../controllers/users.js");

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
// POST sign Route - posts the user details in the backend
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// GET login Route - gets to the form for user login credentials entry
// POST login Route - Authenticated the user login process
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login)
  );

// GET logout Route - Logout the user from the current session
router.get("/logout", userController.logout);

module.exports = router;
