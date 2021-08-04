const express = require("express");
const app = express();
var multer = require("multer");
var session = require("express-session");
const categoryModel = require("../../model/CategoryModel.js");
const { check, validationResult } = require("express-validator");
const AllMiddware = require("../../middleware/AllMiddleware.js");
var bodyParser = require("body-parser");
var userController = require("../../controller/admin/UserController.js");
var vendorController = require("../../controller/admin/VendorController.js");
const router = express.Router();
var cookieParser = require("cookie-parser");

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));
router.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
	})
);
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
var upload = multer({ storage: storage });
// parse application/json
router.use(bodyParser.json());
router.use(cookieParser());

router.get("/admin/register", AllMiddware.userLoggedIn, (req, res) => {
	res.render("admin/UserRegister.ejs", { errors: "" });
});

router.post(
	"/save-user",
	upload.single("image"),
	[
		check("name", "name must be minimum of two character").isLength({ min: 2 }),
		check("email", "email should be valid").isEmail(),
		check("password", "password should be valid").isStrongPassword(),
	],

	userController.saveUser
);

router.get(
	"/admin/users",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.allUsers
);
router.get(
	"/admin/user/delete/:userId",
	AllMiddware.isUserLoggedIn,
	userController.deleteUser
);
router.get(
	"/admin/category/add",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.showAddSubCategoryPage
);
router.post(
	"/admin/category/save-category",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	[check("categoryName", "category name can not be empty").notEmpty()],
	userController.saveCategory
);
router.get(
	"/admin/category",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.fetchAllCategory
);
router.get(
	"/admin/category/delete/:catId",
	AllMiddware.isUserLoggedIn,
	userController.deleteCategory
);
router.get(
	"/admin/product/add",

	AllMiddware.isUserLoggedIn,
	userController.showAddProductPage
);
router.post(
	"/admin/product/add",

	AllMiddware.isUserLoggedIn,
	upload.single("image"),
	[
		check("name", "product name must be minimum of two character ").isLength({
			min: 2,
		}),
		check("mrp", "mrp can not be emptt").isLength({ min: 1 }),
		check("price", "price can not be empty").isLength({ min: 1 }),
		check("quantity", "quantity can not be empty").isLength({ min: 1 }),
		check("shortDescription", "short description can not be empty").isLength({
			min: 1,
		}),
	],
	userController.addProduct
);
router.get(
	"/admin/product",
	AllMiddware.isUserLoggedIn,
	userController.fetchAllProduct
);
router.get(
	"/admin/product/delete/:productId",
	AllMiddware.isUserLoggedIn,
	userController.deleteProduct
);
router.get("/admin/login", AllMiddware.userLoggedIn, (req, res) => {
	res.render("admin/login.ejs");
});
router.post("/admin/login", userController.loginUser);
router.get("/admin/logout", userController.logoutUser);
router.get(
	"/admin/user/dashboard",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.showDashboard
);
router.get(
	"/admin/orders",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.getAllOrders
);
router.get(
	"/admin/order/:orderId",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.getOrderById
);
router.get(
	"/admin/product/edit/:productId",
	AllMiddware.isUserLoggedIn,
	userController.getProductById
);
router.post(
	"/admin/product/editdata",
	upload.single("image"),
	AllMiddware.isUserLoggedIn,
	userController.saveEditedProduct
);
router.get(
	"/admin/subcategory/add",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.showAddSubCategoryPage
);
router.post(
	"/admin/subcategory/save",
	[
		check("subCategoryName", "minumum two character").isLength({ min: 2 }),
		check("subCategoryDetails", "minimum 5 character").isLength({ min: 5 }),
		check("parentCategory", "parent category is mandatory").notEmpty(),
	],
	AllMiddware.isVendor,
	userController.saveSubaCtegory
);
router.get(
	"/admin/subcategory",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.getSubCategory
);
router.get(
	"/admin/subcategory/delete/:subCatId",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.deleteSubCat
);
router.get(
	"/admin/subcategory/update/:subCatId",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.updateSubCat
);
router.post(
	"/admin/subcategory/edit",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.saveEditedSubCat
);
router.post(
	"/get-subcat",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.getSubCat
);

router.get(
	"/admin/cupon/add",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.showAddCuponPage
);
router.post(
	"/admin/save-cupon-data",
	[
		check("cuponCode", "cupon code can not be empty").notEmpty(),
		check("cuponValue", "cupon value can not be empty").notEmpty(),
		check("cuponType", "cupon type can not be empty").notEmpty(),
		check("cartMinValue", "cart minimun value can not be empty").notEmpty(),
	],
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.saveCuponData
);
router.get(
	"/admin/cupon",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.getCupons
);
router.post(
	"/admin/cupon/delete",
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.deleteCupon
);
router.get("/admin/cupon/edit/:cuponId", userController.updateCupon);
router.post(
	"/admin/cupon/save-updated-cupon",
	[
		check("cuponCode", "cupon code can not be empty").notEmpty(),
		check("cuponValue", "cupon value can not be empty").notEmpty(),
		check("cartMinValue", "cart minimum value can be empty").notEmpty(),
	],
	AllMiddware.isUserLoggedIn,
	AllMiddware.isVendor,
	userController.saveUpdatedCupon
);

router.get("/admin/manage-vendor", vendorController.fetchAllVendors);
router.get("/admin/vendor/add", vendorController.showAddVendorPage);
router.post(
	"/admin/vendor/add",
	upload.single("image"),
	[
		check("name", "name must be minimum two character").isLength({ min: 2 }),
		check("email", "enter valid email").isEmail(),
		check("password", "password minimum of six character").isLength({ min: 6 }),
	],
	vendorController.AddVendor
);
router.get("/admin/vendors", vendorController.fetchAllVendors);
router.get("/admin/vendor/delete/:vendorId", vendorController.deleteVendor);
module.exports = router;
