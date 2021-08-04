const userModel = require("../../model/user.js");
const categoryModel = require("../../model/CategoryModel.js");
const productModel = require("../../model/ProductModel.js");
const orderModel = require("../../model/OrderModel.js");
const orderDetailsModel = require("../../model/OrderDetails.js");
const subCategoryModel = require("../../model/SubCategoryModel.js");
const cuponModel = require("../../model/CuponModel.js");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const orderDetails = require("../../model/OrderDetails.js");
exports.saveUser = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.render("admin/UserRegister", { errors: errors.mapped() });
	} else {
		const userDetails = req.body;
		const hashedPassword = await bcrypt.hash(userDetails.password, 10);
		userDetails.password = hashedPassword;
		if (req.file) {
			if (
				req.file.mimetype.includes("/png") ||
				req.file.mimetype.includes("/jpeg") ||
				req.file.mimetype.includes("/jpg")
			) {
				userDetails.image = req.file.filename;
			}
		}

		const user = new userModel(userDetails);
		const newUser = await user.save();
		if (newUser) {
			req.session.admin = newUser._id;
			res.cookie("uid", newUser._id, { maxAge: 360000 });
			res.redirect("/admin/users");
		}
	}
};

exports.allUsers = async (req, res) => {
	var admin = "";

	const allUsers = await userModel.find({});
	if (allUsers) {
		res.render("admin/users", {
			users: allUsers,
			admin: admin,
			role: "",
		});
	}
};
exports.deleteUser = async (req, res) => {
	const deletedUser = await userModel.findOneAndDelete({
		_id: req.params.userId,
	});
	if (deletedUser) {
		res.json({
			status: "ok",
			message: "user deleted",
		});
	}
};
exports.showAddSubCategoryPage = (req, res) => {
	res.render("admin/AddCategory", { errors: "", role: "" });
};
exports.saveCategory = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		res.render("admin/AddCategory", { errors: errors.mapped() });
	} else {
		const categoryDetails = req.body;
		categoryDetails.active = true;
		categoryDetails.deactive = false;
		categoryDetails.delete = false;
		const category = new categoryModel(categoryDetails);
		const newCategory = await category.save();
		res.redirect("/admin/category");
	}
};
exports.fetchAllCategory = async (req, res) => {
	const categories = await categoryModel.find({});
	// res.send(categories);
	res.render("admin/category", { categories: categories, role: "" });
};

exports.deleteCategory = async (req, res) => {
	var catId = req.params.catId;
	const deletedCat = await categoryModel.findOneAndDelete({ _id: catId });
	res.json({
		status: "ok",
		messagez: "category deleted successfully",
	});
};

exports.showAddProductPage = async (req, res) => {
	if (req.session.admin || req.cookies.uid) {
		admin = true;
		currentUserId = req.cookies.uid;
		currentUserDetails = await userModel.findOne({ _id: currentUserId });
	}
	var categories = await categoryModel.find({});

	res.render("admin/AddProduct", {
		categories: categories,
		errors: "",
		role: currentUserDetails.role,
	});
};
exports.addProduct = async (req, res) => {
	const error = validationResult(req);
	var categories = await categoryModel.find({});
	var currentUser = "";
	var currentUserId = "";
	currentUserDetails = "";
	if (req.session.admin || req.cookies.uid) {
		admin = true;
		currentUserId = req.cookies.uid;
		currentUserDetails = await userModel.findOne({ _id: currentUserId });
	}

	if (!error.isEmpty()) {
		console.log(error.mapped());
		res.render("admin/AddProduct", {
			errors: error.mapped(),
			categories: categories,
		});
	} else {
		var productDetails = req.body;
		if (req.file) {
			if (
				req.file.mimetype.includes("/png") ||
				req.file.mimetype.includes("/jpeg") ||
				req.file.mimetype.includes("/jpg")
			) {
				productDetails.image = req.file.filename;
			}
		}
		productDetails.addedBy = currentUserId;
		productDetails.active = true;
		productDetails.delete = false;
		productDetails.deactive = false;
		var product = new productModel(productDetails);
		const newProduct = await product.save();
		res.redirect("/admin/product");
	}
};
exports.fetchAllProduct = async (req, res) => {
	var currentUserId = "";
	var currentUserDetails = "";
	var products = "";
	var currentUserId = "";
	currentUserDetails = "";
	if (req.session.admin || req.cookies.uid) {
		admin = true;
		currentUserId = req.cookies.uid;
		currentUserDetails = await userModel.findOne({ _id: currentUserId });
		if (currentUserDetails.role == "vendor") {
			products = await productModel
				.find({ addedBy: currentUserId })
				.populate("categoryId");
		} else {
			products = await productModel.find({}).populate("categoryId");
		}
	}

	res.render("admin/Product", {
		products: products,
		role: currentUserDetails.role,
	});
};
exports.deleteProduct = async (req, res) => {
	var productId = req.params.productId;
	const deletedProduct = await productModel.findOneAndDelete({
		_id: productId,
	});
	res.json({
		status: "ok",
		message: "product deleted successfully",
	});
};
exports.loginUser = async (req, res) => {
	var email = req.body.email;
	var password = req.body.password;
	const loggedInUser = await userModel.findOne({
		email: email,
	});
	if (loggedInUser) {
		const isPasswordMatched = await bcrypt.compare(
			password,
			loggedInUser.password
		);

		if (isPasswordMatched) {
			req.session.admin = loggedInUser._id;
			res.cookie("uid", loggedInUser._id, { maxAge: 360000 });
			res.redirect("/admin/product");
		} else {
			res.send("invalid email or password");
		}
	} else {
		res.send("dwef");
	}
};

exports.logoutUser = (req, res) => {
	req.session.destroy(function (err) {});
	res.clearCookie("uid");
	res.redirect("/admin/login");
};
exports.showDashboard = async (req, res) => {
	userId = req.session.admin;
	const loggedInUser = await userModel.findOne({ _id: userId });
	res.render("admin/Dashboard", { user: loggedInUser, role: "" });
};
exports.getAllOrders = async (req, res) => {
	const orders = await orderModel.find();
	res.render("admin/Orders", { orders: orders, role: "" });
};
exports.getOrderById = async (req, res) => {
	const orderId = req.params.orderId;
	const orderDeatils = await orderDetailsModel
		.find({ orderId: orderId })
		.populate("orderId");
	console.log(orderDeatils);

	res.render("admin/SingleOrderDeatils", {
		orderDetails: orderDeatils,
		role: "",
	});
};

exports.getProductById = async (req, res) => {
	try {
		const categories = await categoryModel.find({});
		const productId = req.params.productId;
		const product = await productModel.findById(productId);
		res.render("admin/EditProduct", {
			product,
			product,
			errors: "",
			categories: categories,
			role: "",
		});
	} catch (error) {
		res.send("something went wrong");
	}
};
exports.saveEditedProduct = async (req, res) => {
	const productId = req.body.hiddenId;
	const productDetails = req.body;
	const editedProduct = await productModel.findOneAndUpdate(
		{ _id: productId },
		productDetails
	);
	res.redirect("/admin/product");
};
exports.showAddSubCategoryPage = async (req, res) => {
	const categories = await categoryModel.find();
	console.log(categories);
	res.render("admin/AddSubCategory", {
		errors: {
			subCategoryName: "",
			subCategoryDetails: "",
			parentCategory: "",
		},
		categories: categories,
		role: "",
	});
};
exports.saveSubaCtegory = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.mapped());
		const categories = await categoryModel.find();

		res.render("admin/AddSubCategory", {
			errors: errors.mapped(),
			categories: categories,
			role: "",
		});
	}
	const subCategoryDetails = req.body;
	const subCategory = new subCategoryModel(subCategoryDetails);
	const newSubCategory = await subCategory.save();
	res.redirect("/admin/subcategory");
};
exports.getSubCategory = async (req, res) => {
	const subCategory = await subCategoryModel.find().populate("parentCategory");
	res.render("admin/SubCategory", { subCategories: subCategory, role: "" });
};
exports.deleteSubCat = async (req, res) => {
	const deletedSubCat = await subCategoryModel.findOneAndDelete({
		_id: req.params.subCatId,
	});
	res.redirect("/admin/subcategory");
};
exports.updateSubCat = async (req, res) => {
	const subCatId = req.params.subCatId;
	const subCategory = await subCategoryModel
		.findById(subCatId)
		.populate("parentCategory");
	console.log(subCategory);
	const category = await categoryModel.find();

	res.render("admin/updateSubCategory", {
		subCategories: subCategory,
		categories: category,
		role: "",
	});
};
exports.saveEditedSubCat = async (req, res) => {
	const subCategoryDetails = req.body;
	const subcat = await subCategoryModel.findOneAndUpdate(
		{ _id: subCategoryDetails.hiddenId },
		subCategoryDetails
	);
	res.redirect("/admin/subcategory");
};
exports.getSubCat = async (req, res) => {
	const catId = req.body.catId;
	const subCat = await subCategoryModel.find({ parentCategory: catId });
	var html = `<select name='subCategoryId'>`;
	subCat.forEach((data, index) => {
		html += `<option value='${data._id}'>${data.subCategoryName}<option>`;
	});
	html += `</select>`;
	res.json({
		status: "ok",
		subcat: subCat,
		data: html,
	});
};
exports.showAddCuponPage = async (req, res) => {
	res.render("admin/AddCupon", { errors: "", role: "" });
};
exports.saveCuponData = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.mapped());
		res.render("admin/AddCupon", { errors: errors.mapped(), role: "" });
	}
	const cuponDetails = req.body;
	const cupon = new cuponModel(cuponDetails);
	const newCupon = await cupon.save();
	res.redirect("/admin/cupon");
};
exports.getCupons = async (req, res) => {
	const cupons = await cuponModel.find();
	res.render("admin/cupon", { cupons: cupons, role: "" });
};
exports.deleteCupon = async (req, res) => {
	const cuponId = req.body.cuponId;
	const deletedCupon = await cuponModel.findOneAndDelete({ _id: cuponId });
	res.json({
		status: "ok",
		message: "cupon deleted successfully",
		deletedCupon: deletedCupon,
	});
};
exports.updateCupon = async (req, res) => {
	const cuponId = req.params.cuponId;
	const cupon = await cuponModel.findOne({ _id: cuponId });
	console.log(cupon);
	res.render("admin/UpdateCupon", { cupon, cupon, errors: "", role: "" });
};
exports.saveUpdatedCupon = async (req, res) => {
	const cuponId = req.body.hiddenId;
	const errors = validationResult(req);
	console.log(errors);
	if (!errors.isEmpty()) {
		const cupon = await cuponModel.findOne({ _id: cuponId });
		res.render("admin/UpdateCupon", {
			cupon,
			cupon,
			errors: errors.mapped(),
			role: "",
		});
		return;
	}

	const cuponDetails = req.body;
	const updatedCupon = await cuponModel.findOneAndUpdate(
		{ _id: cuponId },
		cuponDetails
	);
	res.redirect("/admin/cupon");
};
