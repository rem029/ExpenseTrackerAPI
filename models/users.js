const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		firstName: {
			type: String,
			required: false,
		},
		lastName: {
			type: String,
			required: false,
		},
		isLogIn: {
			type: Boolean,
			required: false,
		},
	},
	{ timestamps: true }
);
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Users", userSchema, "users");
