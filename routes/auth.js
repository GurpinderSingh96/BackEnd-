const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const BirthDetails = require("../models/BirthDetails");


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected Route (Example)
router.get("/protected", (req, res) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Access granted", user: verified });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

const Post = require("../models/Post");

//This will require to have token if we are using login and sign up auth
// Create Post (Protected)
/*router.post("/post", async (req, res) => {
  let token = req.headers.authorization;

  console.log("Token received:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Access denied" });
  }

  // Remove 'Bearer ' prefix if it exists
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Extract the token after 'Bearer '
  }

  console.log("Stripped token:", token); // Log the token after removing Bearer

  try {
    console.log("JWT_SECRET used for verification:", process.env.JWT_SECRET);

    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified token payload:", verified);

    // Extract the body data
    const { title, content } = req.body;
    console.log("Request body:", req.body);

    // Create a new post
    const newPost = new Post({ title, content, userId: verified.id });
    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ error: "Invalid token or error creating post" });
  }
});*/

//this will allow to post without token 
router.post("/post", async (req, res) => {
  try {
    // Extract the body data
    const { title, content } = req.body;
    console.log("Request body received:", req.body);

    // Create a new post
    const newPost = new Post({ title, content });
    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Error creating post" });
  }
});

router.post("/add", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token after 'Bearer '

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Extract data from the request body
    const { age, yearOfBirth, placeOfBirth } = req.body;

    // Create and save a new BirthDetails document
    const birthDetails = new BirthDetails({
      age,
      yearOfBirth,
      placeOfBirth,
      userId: verified.id, // Associate the entry with the user ID from the token
    });

    const savedDetails = await birthDetails.save();

    res.status(201).json({ message: "Details added successfully", data: savedDetails });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

// Route to retrieve all birth details
router.get("/get", async (req, res) => {
  try {
    const birthDetails = await BirthDetails.find();
    res.status(200).json(birthDetails);
  } catch (error) {
    console.error("Error retrieving birth details:", error.message);
    res.status(500).json({ error: "Failed to retrieve details" });
  }
});

router.put("/update/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token after 'Bearer '

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET);

    // Extract ID from params and data from the body
    const { id } = req.params;
    const { age, yearOfBirth, placeOfBirth } = req.body;

    // Find and update the document by ID
    const updatedDetails = await BirthDetails.findByIdAndUpdate(
      id,
      { age, yearOfBirth, placeOfBirth },
      { new: true } // Return the updated document
    );

    if (!updatedDetails) {
      return res.status(404).json({ error: "Details not found." });
    }

    res.status(200).json({ message: "Details updated successfully.", data: updatedDetails });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    console.error("Error updating birth details:", error.message);
    res.status(500).json({ error: "Failed to update details." });
  }
});

// Route to delete birth details by ID
router.delete("/delete/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token after 'Bearer '

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET);

    // Extract the ID from the request params
    const { id } = req.params;

    // Find the document by ID and delete it
    const deletedDetails = await BirthDetails.findByIdAndDelete(id);

    if (!deletedDetails) {
      return res.status(404).json({ error: "Details not found." });
    }

    res.status(200).json({ message: "Details deleted successfully.", data: deletedDetails });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    console.error("Error deleting birth details:", error.message);
    res.status(500).json({ error: "Failed to delete details." });
  }
});

module.exports = router;