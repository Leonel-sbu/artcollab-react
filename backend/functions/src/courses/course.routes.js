const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Courses list OK" });
});

router.post("/", (req, res) => {
    res.json({ message: "Course created OK" });
});

module.exports = router;
