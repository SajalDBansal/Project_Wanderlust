// Requiring review model for mongoose
const Review = require("../model/review.js");

// Requiring listing model for mongoose
const Listing = require("../model/listing.js");

// "/listings/:id/reviews - to add a review to a particular listing"
module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

// "/listings/:id/reviews/:reviewId - to delete a review from the review model and also delete its instance form the listing in which it is created"
module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  let review = await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
