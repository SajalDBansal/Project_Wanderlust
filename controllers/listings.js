// Requiring listing model for mongoose
const Listing = require("../model/listing.js");

// Requiring mapbox for geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// "/listing" - get request to show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  // Code to store geocoding data of each listing in the database
  // for (let listing of allListings) {
  //   let location = listing.location + ", " + listing.country;
  //   let response = await geocodingClient
  //     .forwardGeocode({
  //       query: location,
  //       limit: 1,
  //     })
  //     .send();
  //   await Listing.findByIdAndUpdate(listing._id, {
  //     geometry: response.body.features[0].geometry,
  //   });
  // }
  res.render("listings/index.ejs", { allListings });
};

// "/listings/new" - get request to get form to create a new entry
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// /listings/:id - get request to show a specific listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// "/listings" - post request to post the from data to create data
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  let listingLocation = newListing.location + ", " + newListing.country;
  let response = await geocodingClient
    .forwardGeocode({
      query: listingLocation,
      limit: 1,
    })
    .send();
  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  // console.log(savedListing);
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// "/listings/:id/edit" - get request to get the update form of data
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// "/listings/:id" - put request to update the data in the database
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  let newListing = await Listing.findById(id);
  if (listing.location != newListing.location) {
    let newLocation = newListing.location + ", " + newListing.country;
    let response = await geocodingClient
      .forwardGeocode({
        query: newLocation,
        limit: 1,
      })
      .send();
    await Listing.findByIdAndUpdate(id, {
      geometry: response.body.features[0].geometry,
    });
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

//  "/listings/:id" - delete request to delete the data from DB
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  // console.log(deleteListing);
  req.flash("success", "Listing Deleted!");
  res.redirect(`/listings`);
};
