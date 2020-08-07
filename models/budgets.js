const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		userID: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		note: {
			type: String,
		},
		amount: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Budgets", budgetSchema, "budgets");
