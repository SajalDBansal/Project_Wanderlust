// Requiring and setting up express
const express = require("express");

// Setting up express router to read listing paths
// mergeParams is used to send parameters from parent to child directory
const router = express.Router({ mergeParams: true });

// Requiring wrapAsync function for error handling
const wrapAsync = require("../utils/wrapAsync.js");

// Requiring funntionality of routes from controlloer files
const reviewController = require("../controllers/reviews.js");

// middleware to for verifications and checks
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

// Add Review Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
