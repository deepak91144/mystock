const mongoose = require("mongoose");
const cuponSchema = new mongoose.Schema({
	cuponCode: {
		type: String,
	},
	cuponType: {
		type: String,
	},
	cuponValue: {
		type: Number,
	},
	cartMinValue: {
		type: Number,
	},
	status: {
		type: String,
	},
});
const Cupon = mongoose.model("cupon", cuponSchema);
module.exports = Cupon;
