// Requiring models for mongoose
const Listing = require("./model/listing.js");
const Review = require("./model/review.js");

// Requiring Schema to validate scehma
const { listingSchema } = require("./shema");
const { reviewSchema } = require("./shema.js");

// Requiring ExpressError class to handle custom errors
const ExpressError = require("./utils/ExpressError.js");

// Check whether the user is logged in before performing tasks
module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.user);
  if (!req.isAuthenticated()) {
    // redirect URL after login
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in before creating a listing");
    return res.redirect("/login");
  }
  next();
};

// Storing the value of URL searched before login to show it back after login
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Checks if the user is the owner of the listing before altering it
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not authorize for this function");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Checks if the user is the owner of the listing before altering it
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not authorize for this function");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// This handles the server side error occured in the Schemas
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Validate function to validate Schema using joi
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
