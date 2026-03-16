const path = require("path");

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const publicPath = `/uploads/${req.file.filename}`;
  const url = `${req.protocol}://${req.get("host")}${publicPath}`;

  return res.status(201).json({
    success: true,
    url,        // absolute URL (best for frontend)
    path: publicPath, // relative path (also useful)
    filename: req.file.filename,
  });
};
