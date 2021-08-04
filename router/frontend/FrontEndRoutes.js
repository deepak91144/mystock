const express = require("express");
const app = express();
const frontendMiddleware = require("../../middleware/frontendMiddleware.js");
var multer = require("multer");
const publishibleKey =
	"pk_test_51J2BZdSBw3w1pRyhri7bH5X7cZ8pp6H4LkT2E3MKFBxqi5IZHBPKexiozRn2ZqkWJNJADiGFkX2ySiA461cEYMG200dTeHmOqy";
const secretKey =
	"sk_test_51J2BZdSBw3w1pRyhjUlQxx2V5bcG8YxAvO85JsYUUryag3M3SjkhwkYeNR1Fm7mTxqPh5PGagK7nhKDW6zopu1lG00fgVSixAX";

const stripe = require("stripe")(secretKey);
let pdf = require("html-pdf");
let ejs = require("ejs");
var session = require("express-session");
const path = require("path");
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
var upload = multer({ storage: storage });
const frontEndController = require("../../controller/frontend/FontEndController.js");
const router = express.Router();
router.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
	})
);

router.get("/", frontEndController.getAllProducts);
router.get("/product/:productId", frontEndController.getProductById);
router.get("/category/:categoryId", frontEndController.getProductByCategoryId);
router.get("/subcat/:subCatId", frontEndController.getProductForSubCat);
router.get("/add-to-cart/:productId/:price", frontEndController.addToCart);
router.get("/cart", frontEndController.getCartProducts);
router.get("/cart/delete/:productId", frontEndController.deleteProductFromCart);
router.get("/cart/update/:productId/:qty", frontEndController.updateQty);
// router.get("/check", (req, res) => {
// 	res.send(req.session.cartData);
// });
router.get("/checkout", frontEndController.checkout);
router.post("/place-order", frontEndController.placeOrder);
router.post("/signup", upload.single("image"), frontEndController.signup);
router.get("/check", async (req, res) => {
	res.send(req.session.user);
});
router.post("/login", frontEndController.login);
router.get("/check-session", (req, res) => {
	if (req.session.user) {
		res.json({
			status: "ok",
			message: "session exist",
			session: req.session.user,
		});
	} else {
		res.json({
			status: "error",
			message: "session does not exist",
			session: req.session.user,
		});
	}
});

router.get("/my-order/:userId", frontEndController.getUserOrders);
router.get("/order/:orderId", frontEndController.getOrderByOrderId);
module.exports = router;
router.get("/login", (req, res) => {
	const user = req.session.user;
	if (user) {
		res.redirect("/");
		return;
	}
	res.render("frontend/Login");
});
router.get("/register", (req, res) => {
	const user = req.session.user;
	if (user) {
		res.redirect("/");
	} else {
		res.render("frontend/Register");
	}
});
router.get("/logout", frontEndController.logoutUser);
router.get("/search", frontEndController.searchProduct);
router.get("/cart-details", frontEndController.getCartDetails);
router.post("/add-to-wishlist", frontEndController.addToWishlist);
router.get("/wishlist", frontEndController.getWishlistProducts);
router.post("/wishlist/delete", frontEndController.deleteProductFromWishList);
router.get("/wishlist-data", frontEndController.getWishlistData);
router.get(
	"/dashboard",
	frontendMiddleware.checkUserLoggedIn,
	frontEndController.userDashboard
);
router.get(
	"/user/update/:userId",
	frontendMiddleware.checkUserLoggedIn,
	frontEndController.updateUser
);
router.post(
	"/user/save-updated-user",
	upload.single("image"),
	frontendMiddleware.checkUserLoggedIn,
	frontEndController.saveUpdatedUser
);
router.get("/forget-password", (req, res) => {
	res.render("frontend/ForgetPassword");
});
router.post(
	"/sendmail/forget-password",
	frontEndController.sendMailForForgetPassword
);
router.get("/reset-password", (req, res) => {
	res.render("frontend/ResetPassword");
});
router.post("/reset-password", frontEndController.resetPasswordForUser);
router.post("/send-otp", frontEndController.sendOtp);
router.post("/verify-otp", frontEndController.verifyOtp);
router.get("/generateReport", (req, res) => {
	ejs.renderFile(path.join("template.ejs"), { name: "deepak" }, (err, data) => {
		if (err) {
			res.send(err);
		} else {
			let options = {
				height: "11.25in",
				width: "8.5in",
				header: {
					height: "20mm",
				},
				footer: {
					height: "20mm",
				},
			};
			pdf.create(data, options).toFile("report.pdf", function (err, data) {
				if (err) {
					res.send(err);
				} else {
					res.sendFile(__dirname + "../../" + "report.pdf");
				}
			});
		}
	});
});
router.get("/get", frontEndController.getRv);
router.post("/cupon-opp", frontEndController.cuponOpperation);
router.post("/save-rating", frontEndController.saveRating);

// stripe testing
router.get("/stripe", (req, res) => {
	res.render("StripeHome", {
		key: publishibleKey,
	});
});
router.post("/payment", frontEndController.stripePayment);
router.get("/thankyou", frontEndController.showThankyouPage);
