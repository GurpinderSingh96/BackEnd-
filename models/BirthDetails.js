const mongoose = require("mongoose");

// Define the schema
const BirthDetailsSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: true, // Correct configuration
  },
  yearOfBirth: {
    type: Number,
    required: true, // Correct configuration
  },
  placeOfBirth: {
    type: String,
    required: true, // Correct configuration
  },
});

// Create the model
module.exports = mongoose.model("BirthDetails", BirthDetailsSchema);

