// Requiring and setting up express
const express = require("express");

// Setting up express router to read listing paths
const router = express.Router();

// Requiring listing model for mongoose
const Listing = require("../model/listing.js");

// Requiring wrapAsync function for error handling
const wrapAsync = require("../utils/wrapAsync");

// Loggedin middleware to check if user is loggedin
const { isLoggedIn, validateListing, isOwner } = require("../middleware.js");

// CRUD operations

/* // Testing the Database Listing model
app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the beach",
        price: 1200,
        location: "Calangute, Goa",
        country: "India"
    });

    await sampleListing.save();
    console.log("Sample saved");
    res.send("Successful testing")
});
*/

// Read Route
// "/listing" - get request to show all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route
// "/listings/new" - get request to get form to create a new entry
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
// /listings/:id - get request to show a specific listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exists!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

// Create routes
// "/listings" - post request to post the from data to create data
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  })
);

// Edit Route
// "/listings/:id/edit" - get request to get the update form of data
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exists!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
// "/listings/:id" - put request to update the data in the database
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
//  "/listings/:id" - delete request to delete the data from DB
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    // console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect(`/listings`);
  })
);

module.exports = router;
