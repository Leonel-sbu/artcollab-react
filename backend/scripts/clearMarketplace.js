/**
 * clearMarketplace.js
 * Deletes ALL artwork documents from MongoDB.
 * Run with: node backend/scripts/clearMarketplace.js
 * (from the project root, with .env present in backend/)
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in backend/.env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const Artwork = require("../src/models/Artwork");
  const count = await Artwork.countDocuments();
  console.log(`Found ${count} artwork(s).`);

  if (count === 0) {
    console.log("Nothing to delete.");
    await mongoose.disconnect();
    return;
  }

  const result = await Artwork.deleteMany({});
  console.log(`Deleted ${result.deletedCount} artwork(s). Marketplace is now empty.`);

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
