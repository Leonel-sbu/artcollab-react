const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Collaborations list OK" });
});

router.post("/", (req, res) => {
  res.json({ message: "Collaboration created OK" });
});

module.exports = router;
