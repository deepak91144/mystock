const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		password: String,
		image: String,
		role: String,
	},
	{ timestamps: true }
);
const User = mongoose.model("users", userSchema);
module.exports = User;
