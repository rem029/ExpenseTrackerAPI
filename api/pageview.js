const express = require("express");
const router = express.Router();
const PageView = require("../models/pageview.js");

router.put("/add", (req, res) => {
	pg = new PageView();
	pg.count = 1;
	pg.save((err) => {
		if (err) {
			res.json({ count: null, message: err.message });
		} else {
			PageView.countDocuments((errCount, number) => {
				if (errCount) {
					res.json({ count: null, message: errCount.message });
				} else {
					res.json({ count: number, message: "success adding page views" });
				}
			});
		}
	});
});

router.get("/get", (req, res) => {
	console.log("Additional Visitor");
	PageView.countDocuments((errCount, number) => {
		if (errCount) {
			res.json({ count: null, message: errCount.message });
		} else {
			res.json({ count: number, message: "success requested page views" });
		}
	});
});

router.get("/test", (req, res) => {
	res.json({ REQUEST: "", RESPONSE: "" });
});

module.exports = router;
