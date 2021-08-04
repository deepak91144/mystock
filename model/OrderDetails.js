const mongoose = require("mongoose");
orderDetailsSchema = mongoose.Schema(
	{
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "order",
		},
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "product",
		},
		qty: {
			type: Number,
		},
	},
	{ timestamp: true }
);
const orderDetails = mongoose.model("orderdetails", orderDetailsSchema);
module.exports = orderDetails;
