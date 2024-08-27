// Requiring and setting up express
const express = require("express");
const app = express();
const port = 3000;

// Requiring and setting up mongoose
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
const Listing = require("./model/listing.js");

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

// Requiring wrapAsync function for error handling
const wrapAsync = require("./utils/wrapAsync.js");

// Requiring ExpressError class to handle custom errors
const ExpressError = require("./utils/ExpressError.js");

// Requiring listing schema to validate scehma
const { listingSchema } = require("./shema.js");

// ValidateLising function to validate listing using joi
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// App Routes listening
app.listen(port, (req, res) => {
  console.log(`App listen to port ${port}`);
});

// Root route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

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

// CRUD operations

// Read Route
// "/listing" - get request to show all listings
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    console.log(allListings);
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route
// "/listings/new" - get request to get form to create a new entry
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
// /listings/:id - get request to show a specific listing
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
);

// Create routes
// "/listings" - post request to post the from data to create data
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// Edit Route
// "/listings/:id/edit" - get request to get the update form of data
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
// "/listings/:id" - put request to update the data in the database
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
//  "/listings/:id" - delete request to delete the data from DB
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect(`/listings`);
  })
);

// Error on each routes not defined
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "PAGE NOT FOUND !"));
});

// Error Handling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "SOMETHING WENT WRONG!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
  // res.send("Something went wrong!");
});
// hello
