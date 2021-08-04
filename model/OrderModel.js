const mongoose = require("mongoose");
const orderSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
		address: {
			type: String,
		},
		city: {
			type: String,
		},
		pincode: {
			type: String,
		},
		paymentType: {
			type: String,
		},
		totalPrice: {
			type: String,
		},
		paymentStatus: {
			type: String,
		},
		orderStatus: {
			type: String,
		},
		cupon: {
			type: mongoose.Schema.Types.ObjectId,
		},
	},
	{ timestamps: true }
);
const Order = mongoose.model("order", orderSchema);
module.exports = Order;
