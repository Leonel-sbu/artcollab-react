const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Orders list OK" });
});

router.post("/", (req, res) => {
    res.json({ message: "Order created OK" });
});

module.exports = router;
