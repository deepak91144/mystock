const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
	{
		subCategoryName: {
			type: String,
		},
		subCategoryDetails: {
			type: String,
		},
		parentCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "category",
		},

		deleted: {
			type: String,
			default: false,
		},
		active: {
			type: String,
			default: true,
		},
		deactive: {
			type: String,
			default: false,
		},
	},
	{ timestamps: true }
);
const SubCategory = mongoose.model("subcategory", subCategorySchema);
module.exports = SubCategory;
