// Requiring and setting up express
const express = require("express");

// Setting up express router to read listing paths
// mergeParams is used to send parameters from parent to child directory
const router = express.Router({ mergeParams: true });

// Requiring review model for mongoose
const Review = require("../model/review.js");

// Requiring listing model for mongoose
const Listing = require("../model/listing.js");

// Requiring wrapAsync function for error handling
const wrapAsync = require("../utils/wrapAsync.js");

// middleware to for verifications and checks
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

// Add Review Route
// "/listings/:id/reviews - to add a review to a particular listing"
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review Route
// "/listings/:id/reviews/:reviewId - to delete a review from the review model and also delete its instance form the listing in which it is created"
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
