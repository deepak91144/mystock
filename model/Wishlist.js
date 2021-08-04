const mongoose = require("mongoose");
const wishlistSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "product",
		},
	},
	{ timestamps: true }
);
const Wishlist = mongoose.model("wishlist", wishlistSchema);
module.exports = Wishlist;
