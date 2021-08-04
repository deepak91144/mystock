var mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;
var productSchema = new mongoose.Schema({
	name: String,
	categoryId: {
		type: objectId,
		ref: "category",
	},
	subCategoryId: {
		type: objectId,
		ref: "subcategory",
	},
	mrp: Number,
	price: Number,
	quantity: Number,
	image: String,
	shortDescription: String,
	description: String,
	metaTitle: String,
	metaDescription: String,
	bestSeller: {
		type: Number,
	},
	addedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	delete: String,
	active: String,
	deactive: String,
});
var Product = mongoose.model("product", productSchema);
module.exports = Product;
