// Requiring and setting up express
const express = require("express");

// Setting up express router to read listing paths
const router = express.Router();

// Requiring multer for multipart form encoding
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Requiring listing model for mongoose
const Listing = require("../model/listing.js");

// Requiring wrapAsync function for error handling
const wrapAsync = require("../utils/wrapAsync");

// Loggedin middleware to check if user is loggedin
const { isLoggedIn, validateListing, isOwner } = require("../middleware.js");

// Requiring funntionality of routes from controlloer files
const listingController = require("../controllers/listings.js");

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

// Index Route
// Create routes
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show Route
// Update Route
// Delete Route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
