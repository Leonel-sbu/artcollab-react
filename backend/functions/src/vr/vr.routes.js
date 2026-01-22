const express = require("express");
const router = express.Router();

router.get("/sessions", (req, res) => {
    res.json({ message: "VR sessions OK" });
});

module.exports = router;
