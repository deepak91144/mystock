const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
	categoryName: String,
	categoryDetails: String,
	active: String,
	deactive: String,
	delete: String,
});
const Category = mongoose.model("category", categorySchema);
module.exports = Category;
