require("dotenv").config();
const connectDB = require("./src/config/db");
const Artwork = require("./src/models/Artwork");

(async () => {
  await connectDB();

  const r = await Artwork.deleteMany({
    status: "published",
    $or: [
      { imageUrl: "" },
      { imageUrl: null },
      { imageUrl: { $exists: false } }
    ],
  });

  console.log("deleted:", r.deletedCount);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
