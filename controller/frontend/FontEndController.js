const productModel = require("../../model/ProductModel.js");
const categoryModel = require("../../model/CategoryModel");
const userModel = require("../../model/user.js");
const orderModel = require("../../model/OrderModel.js");
const orderDetails = require("../../model/OrderDetails.js");
const wishlistModel = require("../../model/Wishlist.js");
const cuponModel = require("../../model/CuponModel.js");
const subCategoryModel = require("../../model/SubCategoryModel.js");
const ratingModel = require("../../model/Rating.js");
const secretKey =
	"sk_test_51J2BZdSBw3w1pRyhjUlQxx2V5bcG8YxAvO85JsYUUryag3M3SjkhwkYeNR1Fm7mTxqPh5PGagK7nhKDW6zopu1lG00fgVSixAX";

const stripe = require("stripe")(secretKey);
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { json } = require("body-parser");

let transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: "iamdj1111@gmail.com", // generated ethereal user
		pass: "9114411559", // generated ethereal password
	},
});

exports.getAllProducts = async (req, res) => {
	const categories = await categoryModel.find();
	const rvp = req.cookies.recentlyViewd;
	console.log(rvp);
	const recentlyViewedProducts = await productModel
		.find({ _id: { $in: rvp } })
		.sort({ _id: -1 });
	console.log(recentlyViewedProducts);
	const user = req.session.user;
	if (req.query.filter) {
		if (req.query.filter == "high-to-low") {
			const products = await productModel
				.find()
				.sort({ price: -1 })
				.populate("categoryId");

			res.render("frontend/home.ejs", {
				products: products,
				term: req.query.filter,
				categories: categories,
				user: user,
				title: "mystock",
				metaTitle: "",
				metaDescription: "",
				recentlyViewedProducts: recentlyViewedProducts,
			});
		}
		if (req.query.filter == "low-to-high") {
			const products = await productModel
				.find()
				.sort({ price: 1 })
				.populate("categoryId");

			res.render("frontend/home.ejs", {
				products: products,
				term: req.query.filter,
				categories: categories,
				user: user,
				title: "mystock",
				metaTitle: "",
				metaDescription: "",
				recentlyViewedProducts: recentlyViewedProducts,
			});
		}
		if (req.query.filter == "newer") {
			const products = await productModel
				.find()
				.sort({ _id: -1 })
				.populate("categoryId");

			res.render("frontend/home.ejs", {
				products: products,
				term: req.query.filter,
				categories: categories,
				user: user,
				title: "mystock",
				metaTitle: "",
				metaDescription: "",
				recentlyViewedProducts: recentlyViewedProducts,
			});
		}
		if (req.query.filter == "older") {
			const products = await productModel
				.find()
				.sort({ _id: 1 })
				.populate("categoryId");

			res.render("frontend/home.ejs", {
				products: products,
				term: req.query.filter,
				categories: categories,
				user: user,
				title: "mystock",
				metaTitle: "",
				metaDescription: "",
				recentlyViewedProducts: recentlyViewedProducts,
			});
		}
		if (req.query.filter == "best-seller") {
			const products = await productModel
				.find({ bestSeller: 1 })

				.populate("categoryId");

			res.render("frontend/home.ejs", {
				products: products,
				term: req.query.filter,
				categories: categories,
				user: user,
				title: "mystock",
				metaTitle: "",
				metaDescription: "",
				recentlyViewedProducts: recentlyViewedProducts,
			});
		}
	} else {
		const products = await productModel.find().populate("categoryId");

		res.render("frontend/home.ejs", {
			products: products,
			term: req.query.filter,
			categories: categories,
			user: user,
			title: "mystock",
			metaTitle: "",
			metaDescription: "",
			recentlyViewedProducts: recentlyViewedProducts,
		});
	}
};
exports.getProductById = async (req, res) => {
	try {
		const productId = req.params.productId;
		var recentlyViewd = req.cookies.recentlyViewd;
		var rv = [];
		if (recentlyViewd) {
			rv = recentlyViewd;
		}

		rv.unshift(productId);
		res.cookie("recentlyViewd", rv, { maxAge: 360000 });
		const categories = await categoryModel.find();
		const product = await productModel.findOne({ _id: productId });
		const user = req.session.user;
		const ratings = await ratingModel
			.find({ productId: productId })
			.populate("productId")
			.populate("userId");

		if (product) {
			res.render("frontend/SingleProduct", {
				product: product,
				categories: categories,
				user: user,
				title: product.name,
				metaTitle: product.metaTitle,
				metaDescription: product.metaDescription,
				ratings: ratings,
			});
		}
	} catch (error) {
		res.redirect("/");
	}
};
exports.getProductByCategoryId = async (req, res) => {
	try {
		const categoryId = req.params.categoryId;
		const category = await categoryModel.findById(categoryId);
		const categories = await categoryModel.find();
		const products = await productModel
			.find({ categoryId: categoryId })
			.populate("categoryId");
		const user = req.session.user;
		const subCat = await subCategoryModel.find({ parentCategory: categoryId });
		console.log(subCat);
		res.render("frontend/CategoryProduct", {
			products: products,
			categories: categories,
			user: user,
			title: category.categoryName,
			metaTitle: "",
			metaDescription: "",
			subCat: subCat,
		});
	} catch (error) {
		res.redirect("/");
	}
};
exports.addToCart = async (req, res) => {
	const productId = req.params.productId;
	const price = req.params.price;
	const product = await productModel.findById(productId);

	if (parseInt(product.quantity) < 1) {
		res.json({
			status: "err",
			message: "product not in stock",
		});
		return;
	}
	if (!req.session.cartData) {
		req.session.cartData = [
			{
				product: productId,
				qty: 1,
				price: price,
			},
		];
	} else {
		req.session.cartData.forEach((data, index) => {
			if (data.product == productId) {
				res.json({
					status: "err",
					message: "product already added to cart",
					data: req.session.cartData,
				});
				return;
			}
		});
		req.session.cartData.push({
			product: productId,
			qty: 1,
			price: price,
		});
	}

	res.json({
		data: req.session.cartData,
		status: "ok",
		message: "product added to cart",
	});
};
exports.getCartProducts = async (req, res) => {
	try {
		var products = req.session.cartData;
		console.log(products);
		var productIds = [];
		var productQty = [];
		const categories = await categoryModel.find();
		var cartTotal = 0;
		products.forEach((data, index) => {
			productIds.push(data.product);
			productQty.push(data.qty);
			cartTotal = cartTotal + parseInt(data.price);
		});
		console.log(productIds);
		const pro = await productModel.find({ _id: { $in: productIds } });

		console.log(pro);
		const user = req.session.user;
		res.render("frontend/Cart", {
			product: pro,
			products: products,
			qty: productQty,
			categories: categories,
			user: user,
			title: "cart",
			metaTitle: "",
			metaDescription: "",
			cartTotal: cartTotal,
		});
	} catch (error) {
		res.redirect("/");
	}
};
exports.deleteProductFromCart = async (req, res) => {
	const productId = req.params.productId;
	const cartData = req.session.cartData;
	cartData.forEach((data, index) => {
		if (data.product == productId) {
			req.session.cartData.splice(index, 1);
		}
	});
	res.json({
		data: req.session.cartData,
		status: "ok",
		message: "product removed successfully",
	});
};
exports.updateQty = async (req, res) => {
	const productQty = req.params.qty;
	const productId = req.params.productId;
	const isPlus = req.query.plus;
	const isMinus = req.query.minus;
	const cartData = req.session.cartData;
	var cartTotal = 0;
	var productPrice = req.query.productPrice;
	var currentUpdatePrice = 0;
	cartData.forEach((data, index) => {
		if (productId === data.product) {
			req.session.cartData[index].qty = parseInt(productQty);
			if (isPlus == "true") {
				req.session.cartData[index].price =
					parseInt(data.price) + parseInt(productPrice);
				currentUpdatePrice = req.session.cartData[index].price;
			}
			if (isMinus == "true") {
				req.session.cartData[index].price =
					parseInt(data.price) - parseInt(productPrice);
				currentUpdatePrice = req.session.cartData[index].price;
			}
		}
	});
	req.session.cartData.forEach((data, index) => {
		cartTotal = parseInt(cartTotal) + parseInt(data.price);
	});
	console.log(req.session.cartData);
	res.json({
		cart: req.session.cartData,
		status: "ok",
		message: "qty updated successfuly",
		cartTotal: cartTotal,
		currentUpdatePrice: currentUpdatePrice,
	});
};
exports.checkout = async (req, res) => {
	try {
		if (req.session.user) {
			var isUserLoggedIn = true;
		}
		var cartTotal = 0;
		var products = req.session.cartData;
		var productIds = [];
		var productQty = [];
		var cartTotal = 0;
		products.forEach((data, index) => {
			productIds.push(data.product);
			productQty.push(data.qty);
		});
		req.session.cartData.forEach((data, index) => {
			cartTotal = parseInt(cartTotal) + parseInt(data.price);
		});
		const pro = await productModel.find({ _id: { $in: productIds } });

		if (pro.length < 1) {
			res.redirect("/");
		}
		const categories = await categoryModel.find();
		const user = req.session.user;
		res.render("frontend/Checkout", {
			product: pro,
			cartProducts: req.session.cartData,
			qty: productQty,
			isUserLoggedIn: isUserLoggedIn,
			categories: categories,
			user: user,
			title: "checkout",
			metaTitle: "",
			metaDescription: "",
			cartTotal: cartTotal,
		});
	} catch (error) {
		res.redirect("/");
	}
};
exports.placeOrder = async (req, res) => {
	const publishibleKey =
		"pk_test_51J2BZdSBw3w1pRyhri7bH5X7cZ8pp6H4LkT2E3MKFBxqi5IZHBPKexiozRn2ZqkWJNJADiGFkX2ySiA461cEYMG200dTeHmOqy";
	const secretKey =
		"sk_test_51J2BZdSBw3w1pRyhjUlQxx2V5bcG8YxAvO85JsYUUryag3M3SjkhwkYeNR1Fm7mTxqPh5PGagK7nhKDW6zopu1lG00fgVSixAX";

	const orderData = req.body;
	var cartTotal = 0;
	var productIds = [];
	req.session.cartData.forEach((data, index) => {
		productIds.push(data.product);
		cartTotal = cartTotal + parseInt(data.price);
	});
	if (orderData.paymentType == "card") {
		req.session.orderData = orderData;
		res.render("StripeHome", { cartTotal: cartTotal, key: publishibleKey });
		return;
	}

	const pro = await productModel.find({ _id: { $in: productIds } });
	orderData.userId = req.session.user;
	orderData.paymentType = "cod";
	orderData.paymentStatus = "done";
	orderData.orderStatus = "pending";
	orderData.totalPrice = cartTotal;
	if (req.session.cuponApplied) {
		orderData.cupon = req.session.cuponApplied.cupon._id;
	}
	const order = new orderModel(orderData);
	const newOrder = await order.save();
	console.log(newOrder);
	req.session.orderId = newOrder._id;
	// end of order collection

	var neworderDeatils = "";

	req.session.cartData.forEach(async (data, index) => {
		var orderDetailsData = {
			orderId: newOrder._id,
			productId: data.product,
			qty: data.qty,
		};

		await productModel.findOneAndUpdate(
			{ _id: data.product },
			{ $inc: { quantity: -1 } }
		);
		console.log(orderDetailsData);
		var orderDeatils = new orderDetails(orderDetailsData);
		neworderDeatils = await orderDeatils.save();
		console.log(neworderDeatils);
	});
	req.session.cartData = null;
	const categories = await categoryModel.find();
	const user = req.session.user;
	const userDetails = await userModel.findById(user);

	const mailOptions = {
		from: "iamdj1111@gmail.com", // sender address
		to: userDetails.email,
		subject: "order placed successfully", // Subject line
		text: "order", // plain text body
		html: ` <p>your order has been placed successfully, your orderId is ${neworderDeatils._id} </p>`,
	};
	transporter.sendMail(mailOptions, (data, error) => {
		if (error) {
		}
	});
	res.redirect("/thankyou");
	req.session.cuponApplied = null;
};

exports.stripePayment = async (req, res) => {
	var cartTotal = 0;
	var productIds = [];
	req.session.cartData.forEach((data, index) => {
		productIds.push(data.product);
		cartTotal = cartTotal + parseInt(data.price);
	});
	var orderData = {};
	if (req.session.orderData) {
		orderData = req.session.orderData;
	}
	const categories = await categoryModel.find();
	const user = req.session.user;
	stripe.customers
		.create({
			email: req.body.stripeEmail,
			source: req.body.stripeToken,
			name: "deepak",

			address: {
				line1: "bbsr",
				postal_code: "13563",
				city: "bbsr",
				state: "odisha",
				country: "india",
			},
		})
		.then((customer) => {
			return stripe.charges.create({
				amount: cartTotal * 100,
				description: "web developemnt product",
				currency: "inr",
				customer: customer.id,
			});
		})
		.then(async (charge) => {
			const pro = await productModel.find({ _id: { $in: productIds } });
			orderData.userId = req.session.user;
			orderData.paymentType = "card";
			orderData.paymentStatus = "done";
			orderData.orderStatus = "pending";
			orderData.totalPrice = cartTotal;
			if (req.session.cuponApplied) {
				orderData.cupon = req.session.cuponApplied.cupon._id;
			}
			const order = new orderModel(orderData);
			const newOrder = await order.save();
			req.session.orderId = newOrder._id;
			console.log(newOrder);
			var neworderDeatils = "";
			console.log(req.session.cartData);
			req.session.cartData.forEach(async (data, index) => {
				var orderDetailsData = {
					orderId: newOrder._id,
					productId: data.product,
					qty: data.qty,
				};

				await productModel.findOneAndUpdate(
					{ _id: data.product },
					{ $inc: { quantity: -1 } }
				);
				console.log(orderDetailsData);
				var orderDeatils = new orderDetails(orderDetailsData);
				neworderDeatils = await orderDeatils.save();
				console.log(neworderDeatils);
			});

			const categories = await categoryModel.find();
			const user = req.session.user;
			const userDetails = await userModel.findById(user);

			const mailOptions = {
				from: "iamdj1111@gmail.com", // sender address
				to: userDetails.email,
				subject: "order placed successfully", // Subject line
				text: "order", // plain text body
				html: ` <p>your order has been placed successfully, your orderId is ${neworderDeatils._id} </p>`,
			};
			transporter.sendMail(mailOptions, (data, error) => {
				if (error) {
				}
			});
			req.session.cartData = null;
			req.session.orderData = null;
			req.session.cuponApplied = null;
			res.redirect("/thankyou");
		})
		.catch((err) => {
			console.log(err);
		});
};
exports.showThankyouPage = async (req, res) => {
	var orderId = req.session.orderId;
	orderData = await orderDetails
		.find({ orderId: orderId })
		.populate("productId")
		.populate("orderId");
	console.log("order data is");
	console.log(orderData);
	req.session.orderId = null;
	if (!orderId) {
		res.redirect("/");
	}
	res.render("frontend/Thankyou", {
		orderData: orderData,
		products: "",
		categories: "",
		user: "",
		title: "thank you",
		metaTitle: "",
		metaDescription: "",
	});
};
exports.signup = async (req, res) => {
	try {
		userDetails = req.body;
		const email = req.body.email;
		const isEmailExist = await userModel.findOne({ email: email });
		if (isEmailExist) {
			res.status(201).json({
				status: "error",
				message: "email address already exist",
			});
		}
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
		userDetails.role = "user";
		const user = new userModel(userDetails);
		const newUser = await user.save();
		if (newUser) {
			req.session.user = newUser._id;
			res.status(201).json({
				status: "ok",
				message: "new User Created Successfully",
				user: newUser,
			});
		}
	} catch (error) {}
};
exports.login = async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const loggedIn = await userModel.findOne({
		email: email,
	});

	if (loggedIn) {
		var isMatched = await bcrypt.compare(password, loggedIn.password);
		console.log(isMatched);
		if (isMatched == true) {
			req.session.user = loggedIn._id;
			if (req.session.wishlist) {
				wishlistDetails = {
					userId: req.session.user,
					productId: req.session.wishlist,
				};
				const wishlist = new wishlistModel(wishlistDetails);
				const newWishlist = await wishlist.save();
			}
			res.json({
				status: "ok",
				message: "user logged in successfully",
			});
		} else {
			res.json({
				status: "error",
				message: "incorrect email or password",
			});
		}
	} else {
		res.json({
			status: "error",
			message: "incorrect email or password",
		});
	}
};
exports.getUserOrders = async (req, res) => {
	const userId = req.params.userId;
	const userOrders = await orderModel.find({ userId: userId });
	const categories = await categoryModel.find();
	const user = req.session.user;
	res.render("frontend/MyOrder", {
		order: userOrders,
		categories: categories,
		user: user,
		title: user.name,
		metaTitle: "",
		metaDescription: "",
	});
};
exports.getOrderByOrderId = async (req, res) => {
	const orderId = req.params.orderId;
	const categories = await categoryModel.find();
	const user = req.session.user;
	const order = await orderModel.findById(orderId);
	res.render("frontend/SingleOrder", {
		order: order,
		categories: categories,
		user: user,
		title: "order",
		metaTitle: "",
		metaDescription: "",
	});
};
exports.logoutUser = async (req, res) => {
	req.session.user = null;
	res.redirect("/");
};
exports.searchProduct = async (req, res) => {
	const categories = await categoryModel.find();
	const user = req.session.user;
	const searchTerm = req.query.search;
	const regx = new RegExp(searchTerm, "i");
	const products = await productModel.find({ name: regx });
	console.log(products);
	res.render("frontend/Search", {
		products: products,
		categories: categories,
		user: user,
		title: "search",
		metaTitle: "",
		metaDescription: "",
	});
};
exports.getCartDetails = async (req, res) => {
	if (req.session.cartData) {
		const cartData = req.session.cartData;
		const numberOfProducts = cartData.length;
		res.status(200).json({
			status: "ok",
			numberOfProduct: numberOfProducts,
		});
	} else {
		res.status(200).json({
			status: "error",
			numberOfProduct: 0,
		});
	}
};
exports.addToWishlist = async (req, res) => {
	req.session.wishlist = req.body.productId;
	if (!req.session.user) {
		res.status(200).json({
			status: "error",
			message: "no",
		});
	} else {
		const productExist = await wishlistModel.findOne({
			productId: req.body.productId,
		});
		if (productExist) {
			res.status(200).json({
				status: "error",
				message: "product already added to wishlist",
			});
		} else {
			const wishlistDetails = {
				userId: req.session.user,
				productId: req.body.productId,
			};
			const wishlist = new wishlistModel(wishlistDetails);
			const newWishlist = await wishlist.save();
			res.status(200).json({
				status: "ok",
				message: "new product added to wishlist",
				product: newWishlist,
			});
		}
	}
};
exports.getWishlistProducts = async (req, res) => {
	const products = await wishlistModel.find().populate("productId");
	if (!req.session.user) {
		res.redirect("/login");
	}
	console.log(products);
	const categories = await categoryModel.find();
	const user = req.session.user;
	res.render("frontend/Wishlist", {
		products: products,
		categories: categories,
		user: user,
		title: "wishlist",
		metaTitle: "",
		metaDescription: "",
	});
};
exports.deleteProductFromWishList = async (req, res) => {
	if (!req.session.user) {
		res.json({
			status: "error",
			message: "no user loggedin",
		});
	}
	const productId = req.body.productId;

	const deletedProduct = await wishlistModel.findOneAndDelete({
		_id: productId,
	});
	res.json({
		status: "ok",
		message: "product removed fro wishlist successfully",
		product: deletedProduct,
	});
};
exports.getWishlistData = async (req, res) => {
	if (req.session.user) {
		const product = await wishlistModel.find({ userId: req.session.user });
		res.json({
			status: "ok",
			numberOfProducts: product.length,
		});
	} else {
		res.json({
			status: "error",
		});
	}
};

exports.userDashboard = async (req, res) => {
	const categories = await categoryModel.find();
	const user = req.session.user;
	const userDetails = await userModel.findById(user);
	res.render("frontend/Dashboard", {
		categories: categories,
		user: user,
		userDetails: userDetails,
		title: "wishlist",
		metaTitle: "",
		metaDescription: "",
	});
};
exports.updateUser = async (req, res) => {
	const userId = req.params.userId;
	const categories = await categoryModel.find();
	const user = req.session.user;
	const userDetails = await userModel.findById(userId);
	console.log(userDetails);
	res.render("frontend/UpdateUser", {
		categories: categories,
		user: user,
		userDetails: userDetails,
		title: "wishlist",
		metaTitle: "",
		metaDescription: "",
	});
};
exports.saveUpdatedUser = async (req, res) => {
	const userDetails = req.body;

	if (userDetails.password.trim() != "") {
		const hashedPassword = await bcrypt.hash(userDetails.password, 10);
		userDetails.password = hashedPassword;
	} else {
		delete userDetails.password;
	}
	if (req.file) {
		if (
			req.file.mimetype.includes("/png") ||
			req.file.mimetype.includes("/jpeg") ||
			req.file.mimetype.includes("/jpg")
		) {
			userDetails.image = req.file.filename;
		}
	}

	console.log(req.body);
	const updatedUser = await userModel.findOneAndUpdate(
		{ _id: req.body.hiddenId },
		userDetails
	);
	res.redirect("/dashboard");
};
exports.sendMailForForgetPassword = async (req, res) => {
	const email = req.body.email;

	const mailOptions = {
		from: "iamdj1111@gmail.com", // sender address
		to: email,
		subject: "Hello ✔", // Subject line
		text: "Hello world?", // plain text body
		html: "<a href='http://localhost:3000/reset-password'>reset your password</a>", // html body
	};
	const isUserExist = await userModel.findOne({ email: email });

	if (isUserExist) {
		res.cookie("cpemail", email, { maxAge: 360000 });
		transporter.sendMail(mailOptions, (data, error) => {
			if (data) {
				res.send("mail send successfully");
			} else {
				res.send("something went wrong");
			}
		});
	} else {
		res.send("email does'nt exist");
	}
};
exports.resetPasswordForUser = async (req, res) => {
	const email = req.cookies.cpemail;
	var password = req.body.password;
	console.log(password);
	hashedPassword = await bcrypt.hash(password, 10);

	const resetPassword = await userModel.findOneAndUpdate(
		{ email: email },
		{ password: hashedPassword }
	);
	if (resetPassword) {
		res.clearCookie("cpemail");
		res.redirect("/dashboard");
	}
};
exports.sendOtp = async (req, res) => {
	const email = req.body.email;
	const otp = req.body.otp;

	res.cookie.otp = otp;
	res.json({
		otp: res.cookie.otp,
	});
	const mailOptions = {
		from: "iamdj1111@gmail.com", // sender address
		to: email,
		subject: "otp", // Subject line0
		text: "otp", // plain text body
		html: `<a href='http://localhost:3000/verify-otp/${otp}'>your otp is ${otp}</a>`, // html body
	};
	transporter.sendMail(mailOptions, (err) => {
		if (err) {
			res.send(err);
		} else {
			res.send("email sent");
		}
	});
};
exports.verifyOtp = async (req, res) => {
	const otpFromBody = req.body.otp;

	const otpFromCookie = req.cookies.otp;
	if (otpFromBody) {
		if (otpFromBody == otpFromCookie) {
			res.json({
				status: "ok",
				message: "otp verified",
			});
		} else {
			res.json({
				status: "error",
				message: "invalid otp",
			});
		}
		return;
	}

	res.json({
		status: "error",
		message: "invalid otp",
	});
};
exports.getProductForSubCat = async (req, res) => {
	const subCatId = req.params.subCatId;
	const products = await productModel.find({ subCategoryId: subCatId });
	res.render("frontend/SubCatProducts", { products: products });
};
exports.getRv = async (req, res) => {
	const rvp = req.cookies.recentlyViewd;
	console.log(rvp);
	const pro = await productModel.find({ _id: { $in: rvp } }).sort({ _id: -1 });

	console.log(pro);
	res.render("frontend/RecentlyViewed", { products: pro });
};
exports.cuponOpperation = async (req, res) => {
	const cupon = req.body.cupon;
	var cartData = req.session.cartData;
	if (cartData) {
		var productIds = cartData.map((data, index) => {
			return data.product;
		});
	}
	const isCuponExist = await cuponModel.findOne({ cuponCode: cupon });
	console.log(isCuponExist);
	if (isCuponExist) {
		if (isCuponExist.status == "true") {
			var cartTotal = 0;
			const product = await productModel.find({ _id: { $in: productIds } });
			product.forEach((data, index) => {
				cartTotal = cartTotal + parseInt(data.price);
			});
			if (cartTotal >= isCuponExist.cartMinValue) {
				var cartTotalAfterCuponApplied = cartTotal - isCuponExist.cuponValue;

				req.session.cuponApplied = {
					cupon: isCuponExist,
					cartTotalAfterCuponApplied: cartTotalAfterCuponApplied,
				};

				res.json({
					cartTotalAfterCuponApplied: cartTotalAfterCuponApplied,
					status: "ok",
					message: "yes applicable",
					cartTotal: cartTotal,
					cartTotalAfterCuponApplied: cartTotalAfterCuponApplied,

					cartMinValue: isCuponExist.cartMinValue,
				});
			} else {
				res.json({
					status: "error",
					message: `this cupon is applicable upon minimum cart value of:${isCuponExist.cartMinValue}`,
					cartTotal: cartTotal,
					cartMinValue: isCuponExist.cartMinValue,
				});
			}
		} else {
			res.json({
				status: "error",
				message: "cupon is no more active now",
			});
		}
	} else {
		res.json({
			status: "error",
			message: "cupon doesnt exist",
		});
	}
};

exports.saveRating = async (req, res) => {
	if (!req.session.user) {
		res.json({
			status: "error",
			message: "you have to loggedin first",
		});
		return;
	}
	productId = req.body.productId;
	userId = req.session.user;
	formData = req.body.formData;
	var x = formData.split("&");
	var ratingString = x[0];
	var reviewString = x[1];
	var ratingArr = ratingString.split("=");
	var reviewArr = reviewString.split("=");
	var rating = ratingArr[1];
	var review = reviewArr[1];
	var rev = review.replace(/%/g, " ");
	var ratingDetails = {
		rating: rating,
		review: rev.replace(/20/g, ""),
		productId: productId,
		userId: userId,
		status: false,
	};
	console.log(rev);
	const rate = new ratingModel(ratingDetails);
	const newRating = await rate.save();
	res.json({
		status: "ok",
		message: "new rating added",
		rating: newRating,
	});
};
