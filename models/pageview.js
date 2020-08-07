const mongoose = require("mongoose");

const pageView = new mongoose.Schema(
	{
		count: {
			type: Number,
			required: true,
		},
		item: {
			type: Object,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("PageView", pageView, "pageview");
