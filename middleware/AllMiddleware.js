const userModel = require("../model/user.js");
exports.isUserLoggedIn = async (req, res, next) => {
	if (req.session.admin || req.cookies.uid) {
		if (req.cookies.uid) {
			var userId = req.cookies.uid;
			const loggedInUser = await userModel.findOne({ _id: userId });
			req.session.admin = loggedInUser._id;
		}

		next();
	} else {
		res.redirect("/admin/login");
	}
};
exports.userLoggedIn = async (req, res, next) => {
	if (req.session.admin || req.cookies.uid) {
		res.redirect("/admin/product");
	} else {
		next();
	}
};

exports.isVendor = async (req, res, next) => {
	if (req.session.admin) {
		var userId = req.session.admin;
		var loggedInUser = await userModel.findOne({ _id: userId });
		if (loggedInUser.role == "vendor") {
			res.redirect("/admin/product");
		} else {
			next();
		}
	}
};
