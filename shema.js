// Requiring joi to validate schema
const joi = require("joi");

// Requiring and setting ListingSchema
// const Listing = require("./model/listing.js");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      location: joi.string().required(),
      country: joi.string().required(),
      price: joi.number().required().min(0),
      image: joi.string().allow("", null),
    })
    .required(),
});