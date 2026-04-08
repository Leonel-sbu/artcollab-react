require("dotenv").config();
const connectDB = require("./src/config/db");
const Artwork = require("./src/models/Artwork");

(async () => {
  await connectDB();

  // Match URLs that are NOT valid: should start with /uploads/ or https:// or picsum.photos
  const bad = /^http:\/\/localhost/;

  const r = await Artwork.updateMany(
    { imageUrl: { $regex: bad } },
    { $set: { imageUrl: "" } }
  );

  console.log(" fixed bad imageUrl:", r.modifiedCount);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
