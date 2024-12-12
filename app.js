// Requiring only i developement phase
// Requiring dotenv to access data from .env file
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// Requiring and setting up express
const express = require("express");
const app = express();
const port = 3000;

// Requiring and setting up mongoose
const mongoose = require("mongoose");
const DB_URL = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(DB_URL);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
const User = require("./model/user.js");

// Requiring ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));

// Encoding json & urlencoded data in express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Requiring method-override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// Requiring ejs-mate
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

// Requiring express sessions for user sessions
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Requiring connect flash to show flash data
const flash = require("connect-flash");

// Requiring passport & its variable npm packages
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Requiring ExpressError class to handle custom errors
const ExpressError = require("./utils/ExpressError.js");

// Requiring routes from router folder using express Router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Setting up session options to create session instance
const store = MongoStore.create({
  mongoUrl: DB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE ", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    manAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Using session to create cookies & flash to flash data on screen
app.use(session(sessionOptions));
app.use(flash());

// Using passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Using passport for authentication strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash connecting middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Adding listing routes from /routes/listing.js
app.use("/listings", listingRouter);

// Adding review routes from /routes/review.js
app.use("/listings/:id/reviews", reviewRouter);

// Adding user routes from /routes/user.js
app.use("/", userRouter);

// Error on each routes not defined
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "PAGE NOT FOUND !"));
});

// Custom Error Handling
app.use((err, req, res, next) => {
  // Assigning basic status code and message if not provided in error
  let { statusCode = 500, message = "SOMETHING WENT WRONG!" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// App Routes listening
app.listen(port, (req, res) => {
  console.log(`App listen to port ${port}`);
});
