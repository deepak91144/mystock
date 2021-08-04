const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema(
	{
		rating: {
			type: String,
		},
		review: {
			type: String,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "product",
		},
		status: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);
const Rating = mongoose.model("rating", ratingSchema);
module.exports = Rating;
