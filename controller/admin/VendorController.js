const { check, validationResult } = require("express-validator");
let userModel = require("../../model/user.js");
const bcrypt = require("bcrypt");
exports.showAddVendorPage = async (req, res) => {
	res.render("admin/vendor/AddVendor", { errors: "" });
};
exports.AddVendor = async (req, res) => {
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.mapped());
		res.render("admin/vendor/AddVendor", { errors: errors.mapped() });
	} else {
		var vendorDetails = req.body;
		if (req.file) {
			if (
				req.file.mimetype.includes("/png") ||
				req.file.mimetype.includes("/jpeg") ||
				req.file.mimetype.includes("/jpg")
			) {
				vendorDetails.image = req.file.filename;
			}
		}
		let hashedPassword = await bcrypt.hash(vendorDetails.password, 10);
		vendorDetails.password = hashedPassword;
		let vendor = userModel(vendorDetails);
		let newVendor = await vendor.save();
		res.redirect("/admin/vendors");
	}
};
exports.fetchAllVendors = async (req, res) => {
	let vendors = await userModel.find({ role: "vendor" });
	res.render("admin/vendor/Vendors", { vendors: vendors });
};
exports.deleteVendor = async (req, res) => {
	let vendorId = req.params.vendorId;
	let deletedVendor = await userModel.findOneAndDelete({ _id: vendorId });
	res.json({
		status: "ok",
		message: "vendor deleted successfully",
		deletedVendor: deletedVendor,
	});
};
